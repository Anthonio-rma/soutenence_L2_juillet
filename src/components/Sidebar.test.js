import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

describe('Sidebar alert badge', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('affiche le nombre réel d\'alertes depuis l\'API', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, lat: 1.2, lng: 2.3 },
        { id: 2, lat: 3.4, lng: 4.5 },
      ],
    });

    render(
      <MemoryRouter>
        <Sidebar isCollapsed={false} setIsCollapsed={jest.fn()} />
      </MemoryRouter>
    );

    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
