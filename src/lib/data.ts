import type { Trip } from '../types'

export const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    title: 'Escapade Bleue : Saïdia & Cap de l\'Eau',
    description: 'Une journée détente entre les plages de Saïdia et les falaises du Cap de l\'Eau. Dégustation de poissons frais incluse.',
    price: 45,
    date: '2026-05-15',
    departure_time: '08:00',
    places_total: 20,
    places_reserved: 12,
    image_url: 'https://images.unsplash.com/photo-1539635278303-d4002c07dee3?auto=format&fit=crop&q=80&w=1000',
    status: 'active',
    destinations: [
      {id: 'd1', name: 'Départ Oujda', order_index: 0, trip_id: '1', description: 'Rassemblement à la place de la gare.'},
      {id: 'd2', name: 'Cap de l\'Eau', order_index: 1, trip_id: '1', description: 'Visite des falaises et pause café.'},
      {id: 'd3', name: 'Saïdia', order_index: 2, trip_id: '1', description: 'Après-midi libre sur la plage.'},
      {id: 'd4', name: 'Retour', order_index: 3, trip_id: '1', description: 'Arrivée prévue à Oujda vers 20h.'}
    ]
  },
  {
    id: '2',
    title: 'Aventure Marchica & Nador',
    description: 'Découvrez la lagune de Marchica et profitez d\'un tour panoramique de la ville de Nador. Idéal pour les familles.',
    price: 60,
    date: '2026-05-18',
    departure_time: '07:30',
    places_total: 20,
    places_reserved: 20,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
    status: 'active',
    destinations: [
      {id: 'd5', name: 'Oujda', order_index: 0, trip_id: '2', description: 'Départ matinal.'},
      {id: 'd6', name: 'Lagune Marchica', order_index: 1, trip_id: '2', description: 'Balade et photos.'},
      {id: 'd7', name: 'Corniche de Nador', order_index: 2, trip_id: '2', description: 'Temps libre et shopping.'}
    ]
  },
  {
    id: '3',
    title: 'Grotte du Chameau & Tafoughalt',
    description: 'Une immersion en pleine nature dans les montagnes de Beni Snassen. Visite de la grotte et déjeuner traditionnel.',
    price: 55,
    date: '2026-05-22',
    departure_time: '08:30',
    places_total: 20,
    places_reserved: 5,
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    status: 'active',
    destinations: [
      {id: 'd8', name: 'Zegzel', order_index: 0, trip_id: '3', description: 'Traversée de la vallée.'},
      {id: 'd9', name: 'Grotte du Chameau', order_index: 1, trip_id: '3', description: 'Visite guidée.'},
      {id: 'd10', name: 'Tafoughalt', order_index: 2, trip_id: '3', description: 'Déjeuner en forêt.'}
    ]
  }
]
