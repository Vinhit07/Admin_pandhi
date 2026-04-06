// Outlet Context
// Provides outlet selection and management for admin app

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { apiRequest } from '../lib/api'
import { API_ENDPOINTS } from '../lib/constants'
import { useAuth } from './AuthContext'

export interface Outlet {
    id: number
    name: string
    location?: string
}

interface OutletContextType {
    outlets: Outlet[]
    selectedOutlet: Outlet | null
    outletId: number | 'ALL' | null
    selectOutlet: (outletId: number | 'ALL') => void
    loading: boolean
}

const OutletContext = createContext<OutletContextType | undefined>(undefined)

export const OutletProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth()
    const [outlets, setOutlets] = useState<Outlet[]>([])
    const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null)
    const [selectedOutletId, setSelectedOutletId] = useState<number | 'ALL' | null>(null)
    const [loading, setLoading] = useState(true)

    // Effect to initialize outlets based on user role
    useEffect(() => {
        const initializeOutlets = async () => {
            if (!isAuthenticated || !user) {
                setOutlets([])
                setSelectedOutlet(null)
                setSelectedOutletId(null)
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                let fetchedOutlets: Outlet[] = []

                if (user.role === 'SUPERADMIN') {
                    // SuperAdmin: Fetch all outlets
                    const response = await apiRequest(API_ENDPOINTS.GET_OUTLETS, {
                        method: 'GET',
                    })
                    fetchedOutlets = response.data || []
                } else if (user.role === 'ADMIN') {
                    // Admin: Use outlets from user object (AuthContext)
                    // Map generic user.outlets structure to Outlet interface
                    // user.outlets might be [{ outletId, outlet: { name, ... } }] or direct Outlet[]
                    // Based on previous files, it seems to be nested in `outlet` property
                    const adminUser = user as any;
                    if (adminUser.outlets && Array.isArray(adminUser.outlets)) {
                        fetchedOutlets = adminUser.outlets.map((o: any) => ({
                            id: o.outletId || o.id,
                            name: o.outlet?.name || o.name || `Outlet ${o.outletId}`,
                            location: o.outlet?.address || o.address
                        }))
                    }
                }

                setOutlets(fetchedOutlets)

                // Initialize selection
                // If previously selected ID is still valid, keep it. Otherwise default.

                let targetId: number | 'ALL' | null = selectedOutletId;

                // Force 'ALL' to be invalid since it is hidden now
                if (targetId === 'ALL') {
                    targetId = null;
                }

                // Check if selected numeric ID still exists in the fetched list
                if (targetId && typeof targetId === 'number') {
                    const stillExists = fetchedOutlets.find(o => o.id === targetId);
                    if (!stillExists) {
                        targetId = null;
                    }
                }

                // If no valid target, default to first available outlet
                // CHANGE: For Dashboard Consolidation, we want to default to ALL (null) if possible, 
                // but maybe only for SUPERADMIN? The user said "display cumulative...".
                // Let's default to ALL (null) if no targetId is set.

                // If user is ADMIN (restricted), they might only have 1 outlet. 
                // But if SUPERADMIN, we default to null (ALL).
                if (!targetId && fetchedOutlets.length > 0) {
                    if (user.role === 'ADMIN') {
                        targetId = fetchedOutlets[0].id;
                    } else {
                        // Keep as null for "All Vendors" view
                        targetId = null;
                    }
                }

                if (targetId) {
                    selectOutlet(targetId);
                } else {
                    setSelectedOutletId(null);
                    setSelectedOutlet(null);
                }

            } catch (error) {
                console.error('Error initializing outlets:', error)
            } finally {
                setLoading(false)
            }
        }

        initializeOutlets()
    }, [isAuthenticated, user?.role, user]) // Re-run if user/role changes

    const selectOutlet = (id: number | 'ALL') => {
        setSelectedOutletId(id)
        if (id === 'ALL') {
            setSelectedOutlet(null)
        } else {
            const outlet = outlets.find(o => o.id === id)
            setSelectedOutlet(outlet || null)
        }
    }

    const value = {
        outlets,
        selectedOutlet,
        outletId: selectedOutletId,
        selectOutlet,
        loading,
    }

    return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>
}

export const useOutlet = () => {
    const context = useContext(OutletContext)
    if (context === undefined) {
        throw new Error('useOutlet must be used within OutletProvider')
    }
    return context
}
