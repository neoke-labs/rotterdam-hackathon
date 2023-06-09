const processReservation = (
  reservationId,
  reservation,
  hotels,
  setReservation,
  setReservationId,
) => {
  if (reservation) {
    const hotel = hotels.find((h) => h.id == reservation.hotel_id);
    reservation = hotel
      ? {
          ...reservation,
          hotel: hotel.name,
        }
      : {};
  }
  setReservation(reservation);
  setReservationId(reservationId);
};

export { processReservation };
