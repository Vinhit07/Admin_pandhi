// Outlet Context
// Provides outlet selection and management for admin app

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { apiRequest } from '../lib/api'
import { API_ENDPOINTS } from '../lib/constants'

interface Outlet {
    id: number
    name: string
    location?: string
}

interface OutletContextType {
    outlets: Outlet[]
    selectedOutlet: Outlet | null
    outletId: number | null
    selectOutlet: (outletId: number) => void
    loading: boolean
}

const OutletContext = createContext<OutletContextType | undefined>(undefined)

export const OutletProvider = ({ children }: { children: ReactNode }) => {
    const [outlets, setOutlets] = useState<Outlet[]>([])
    const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOutlets()
    }, [])

    const fetchOutlets = async () => {
        try {
            setLoading(true)
            const response = await apiRequest(API_ENDPOINTS.GET_OUTLETS, {
                method: 'GET',
            })
            const outletList = response.data || []
            setOutlets(outletList)

            // Auto-select first outlet
            if (outletList.length > 0) {
                setSelectedOutlet(outletList[0])
            }
        } catch (error) {
            console.error('Error fetching outlets:', error)
        } finally {
            setLoading(false)
        }
    }

    const selectOutlet = (outletId: number) => {
        const outlet = outlets.find(o => o.id === outletId)
        if (outlet) {
            setSelectedOutlet(outlet)
        }
    }

    const value = {
        outlets,
        selectedOutlet,
        outletId: selectedOutlet?.id || null,
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
