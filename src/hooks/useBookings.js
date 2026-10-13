import { useState, useEffect, useCallback } from 'react'

export function useBookings() {
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('ravtur-bookings')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('ravtur-bookings', JSON.stringify(bookings))
  }, [bookings])

  const addBooking = useCallback((booking) => {
    const newBooking = {
      ...booking,
      id: `BK-${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }
    setBookings((prev) => [newBooking, ...prev])
    return newBooking
  }, [])

  const cancelBooking = useCallback((id) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b))
  }, [])

  const getBooking = useCallback((id) => bookings.find((b) => b.id === id) || null, [bookings])

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed')
  const pastBookings = bookings.filter(b => b.status === 'completed')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  return { bookings, addBooking, cancelBooking, getBooking, upcomingBookings, pastBookings, cancelledBookings }
}