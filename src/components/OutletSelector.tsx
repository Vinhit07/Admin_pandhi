// Outlet Selector Component
// Dropdown to select active outlet

import { useOutlet } from '../context/OutletContext'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import { Building2 } from 'lucide-react'

export const OutletSelector = () => {
    const { outlets, selectedOutlet, selectOutlet, loading } = useOutlet()

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Loading outlets...
            </div>
        )
    }

    if (outlets.length === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                No outlets available
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select
                value={selectedOutlet?.id.toString()}
                onValueChange={(value) => selectOutlet(parseInt(value))}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                    {outlets.map((outlet) => (
                        <SelectItem key={outlet.id} value={outlet.id.toString()}>
                            {outlet.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
