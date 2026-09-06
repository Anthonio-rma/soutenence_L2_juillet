const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importGeoJSON() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("--- Initialisation de l'importation GeoJSON (Base distante ancienne version) ---");

        if (!fs.existsSync('./export.geojson')) {
            throw new Error("Le fichier 'export.geojson' est introuvable.");
        }

        const rawData = fs.readFileSync('./export.geojson', 'utf8');
        const data = JSON.parse(rawData);

        const features = data.features || [];
        console.log(`Nombre d'éléments totaux dans le fichier : ${features.length}`);

        let totalAnalysed = 0;
        let insertedRoutes = 0;
        let insertedStops = 0;

        for (const feature of features) {
            totalAnalysed++;
            
            // Log toutes les 500 entrées lues pour voir que la boucle tourne
            if (totalAnalysed % 500 === 0) {
                console.log(`> Lecture du fichier : ${totalAnalysed} / ${features.length} éléments scannés...`);
            }

            const props = feature.properties;
            const geom = feature.geometry;
            if (!geom || !props) continue;

            if (geom.type === 'LineString' && props.route === 'bus') {
                const operator = props.operator || 'Inconnu';
                console.log(`[Ligne] Insertion de la ligne - Coopérative : ${operator} (Réf: ${props.ref || 'N/A'})`);

                await connection.execute('INSERT IGNORE INTO cooperatives (name) VALUES (?)', [operator]);
                const [coopRows] = await connection.execute('SELECT id FROM cooperatives WHERE name = ?', [operator]);
                const coopId = coopRows[0].id;

                const wkt = 'LINESTRING(' + geom.coordinates.map(([lon, lat]) => `${lon} ${lat}`).join(',') + ')';

                await connection.execute(
                    'INSERT INTO bus_routes (id, ref, name, operator, coop_id, route_geom) VALUES (?, ?, ?, ?, ?, ST_GeomFromText(?)) ON DUPLICATE KEY UPDATE route_geom = ST_GeomFromText(?)',
                    [feature.id.replace('relation/', ''), props.ref || 'N/A', props.name || 'Nom inconnu', operator, coopId, wkt, wkt]
                );
                insertedRoutes++;
            }
            else if (geom.type === 'Point' && (props.public_transport === 'platform' || props.highway === 'bus_stop')) {
                const [lon, lat] = geom.coordinates;
                console.log(`[Arrêt] Insertion de l'arrêt : ${props.name || "Arrêt sans nom"}`);

                await connection.execute(
                    'INSERT IGNORE INTO bus_stops (id, name, location) VALUES (?, ?, PointFromText(?))',
                    [feature.id.replace('node/', ''), props.name || "Arrêt sans nom", `POINT(${lon} ${lat})`]
                );
                insertedStops++;
            }
        }
        console.log("\n--- Importation terminée avec succès ! ---");
        console.log(`Lignes de bus insérées : ${insertedRoutes}`);
        console.log(`Arrêts de bus insérés : ${insertedStops}`);
    } catch (err) {
        console.error("\nErreur critique lors de l'insertion :", err);
    } finally {
        if (connection) await connection.end();
    }
}

importGeoJSON();