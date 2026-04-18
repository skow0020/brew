import { Suspense, lazy } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
const BeersPage = lazy(() => import('./pages/BeersPage').then((module) => ({ default: module.BeersPage })))
const EventsPage = lazy(() => import('./pages/EventsPage').then((module) => ({ default: module.EventsPage })))
const TaproomPage = lazy(() => import('./pages/TaproomPage').then((module) => ({ default: module.TaproomPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then((module) => ({ default: module.ContactPage })))
const AdminBeersPage = lazy(() => import('./pages/AdminBeersPage').then((module) => ({ default: module.AdminBeersPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

function RouteLoadingFallback() {
  return (
    <Box sx={{ minHeight: 220, display: 'grid', placeItems: 'center' }}>
      <CircularProgress size={28} />
    </Box>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/beers"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <BeersPage />
            </Suspense>
          }
        />
        <Route
          path="/events"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <EventsPage />
            </Suspense>
          }
        />
        <Route
          path="/taproom"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <TaproomPage />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <ContactPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/beers"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <AdminBeersPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
