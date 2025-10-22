// import { render, screen, fireEvent } from '@testing-library/react';
// import { describe, test, expect, vi, beforeEach } from 'vitest';
// import AdressInput from './AdressInput';

// // ===================================================================
// // MOCK CORRIGIDO E SIMPLIFICADO (NO TOPO DO ARQUIVO)
// // ===================================================================

// // Mock das dependências simples
// vi.mock('@/components/molecules/InputField/inputField', () => ({
//   default: (props: any) => <input data-testid="input-field" {...props} />,
// }));
// vi.mock('lucide-react', () => ({
//   X: () => <div data-testid="delete-icon">X</div>,
// }));

// // Mock do SearchBox com um "gatilho" para o teste
// vi.mock('@react-google-maps/api', () => ({
//   StandaloneSearchBox: ({ children, onLoad, onPlacesChanged }: any) => {
//     // Simula o onLoad, que é essencial para o componente
//     if (onLoad) {
//       onLoad({ getPlaces: mockGetPlaces });
//     }
//     return (
//       <div>
//         {children}
//         {/* Este botão é o nosso gatilho. O teste vai clicar nele para simular o onPlacesChanged */}
//         <button data-testid="places-changed-trigger" onClick={onPlacesChanged}></button>
//       </div>
//     );
//   },
// }));

// // Mock da função que o Google Maps API retorna
// const mockGetPlaces = vi.fn();

// // ===================================================================
// // TESTES USANDO A NOVA ABORDAGEM
// // ===================================================================

// describe('AdressInput (Unit Component)', () => {
//   const defaultProps = {
//     index: 0,
//     setWaypoints: vi.fn(),
//     waypoints: [],
//     map: { panTo: vi.fn() } as any,
//     setInitialCenter: vi.fn(),
//     value: '',
//     handleDeleteWaypoint: vi.fn(),
//   };

//   beforeEach(() => {
//     vi.clearAllMocks(); // Limpa os mocks antes de cada teste
//   });

//   test('should render the input field', () => {
//     render(<AdressInput {...defaultProps} />);
//     expect(screen.getByTestId('input-field')).toBeInTheDocument();
//   });

//   test('should call setWaypoints when a place is selected', () => {
//     // Arrange
//     const fakePlace = { geometry: { location: { lat: () => -7.11, lng: () => -34.86 } } };
//     mockGetPlaces.mockReturnValue([fakePlace]);
//     const setWaypointsMock = vi.fn();

//     render(<AdressInput {...defaultProps} setWaypoints={setWaypointsMock} />);
    
//     // Act: Encontra e clica no nosso botão de gatilho
//     const triggerButton = screen.getByTestId('places-changed-trigger');
//     fireEvent.click(triggerButton);

//     // Assert
//     const expectedLocation = { lat: -7.11, lng: -34.86 };
//     expect(setWaypointsMock).toHaveBeenCalledWith([expectedLocation]);
//   });

//   test('should call setInitialCenter and panTo when it is the first waypoint', () => {
//     // Arrange
//     const fakePlace = { geometry: { location: { lat: () => 10, lng: () => 20 } } };
//     mockGetPlaces.mockReturnValue([fakePlace]);
//     const setInitialCenterMock = vi.fn();
//     const mapPanToMock = vi.fn();

//     render(<AdressInput {...defaultProps} waypoints={[]} setInitialCenter={setInitialCenterMock} map={{ panTo: mapPanToMock } as any} />);

//     // Act: Clica no gatilho
//     const triggerButton = screen.getByTestId('places-changed-trigger');
//     fireEvent.click(triggerButton);

//     // Assert
//     const expectedLocation = { lat: 10, lng: 20 };
//     expect(setInitialCenterMock).toHaveBeenCalledWith(expectedLocation);
//     expect(mapPanToMock).toHaveBeenCalledWith(expectedLocation);
//   });

//   test('should call handleDeleteWaypoint when the delete icon is clicked', () => {
//     // Arrange
//     const handleDeleteWaypointMock = vi.fn();
//     render(<AdressInput {...defaultProps} index={0} handleDeleteWaypoint={handleDeleteWaypointMock} />);

//     // Act
//     const deleteIconContainer = screen.getByTestId('delete-icon').parentElement;
//     fireEvent.click(deleteIconContainer!);

//     // Assert
//     expect(handleDeleteWaypointMock).toHaveBeenCalledWith(0);
//   });
// });