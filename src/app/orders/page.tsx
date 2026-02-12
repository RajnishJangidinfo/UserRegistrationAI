"use client"

import { useEffect, useState } from "react"
import { getOrders, Order } from "@/lib/api"
import { ShoppingBag, Calendar, User, Mail, Phone, CreditCard, ChevronRight, AlertCircle, Loader2, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function OrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateStr))
    }

    useEffect(() => {
        const fetchOrders = async () => {
            const response = await getOrders()
            if (response.success) {
                setOrders(response.data || [])
            } else {
                setError(response.message)
            }
            setLoading(false)
        }
        fetchOrders()
    }, [])

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                        Sales Ledger
                    </h2>
                    <p className="text-zinc-400 font-medium italic">Tracking the flow of intergalactic knowledge through the universe.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-12 px-6 glass rounded-xl flex items-center gap-3 border-white/5">
                        <ShoppingBag className="h-5 w-5 text-indigo-400" />
                        <span className="text-white font-bold">{orders.length}</span>
                        <span className="text-zinc-500 text-sm uppercase tracking-tighter">Total Transactions</span>
                    </div>
                    <Button
                        onClick={() => router.push('/books')}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/20"
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" /> New Order
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500/50" />
                    <p className="animate-pulse">Retrieving historical records...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl flex items-center gap-4">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                    <div>
                        <p className="font-bold">Access Denied</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="glass rounded-3xl p-24 text-center border-dashed border-2 border-white/5">
                    <div className="h-20 w-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-700">
                        <ShoppingBag size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">The Ledger is Empty</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto mb-8">No transactions have been recorded in this quadrant yet. Head back to the library to initiate an order.</p>
                    <Button
                        onClick={() => router.push('/books')}
                        variant="premium"
                        className="px-8"
                    >
                        Go to Library
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <div key={order.id} className="glass group hover:bg-white/5 transition-all duration-300 rounded-2xl overflow-hidden border-white/5 p-6 flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <Package className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{order.bookTitle}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-medium">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(order.orderDate)}
                                                <span className="mx-2 text-zinc-800">|</span>
                                                <span className="text-zinc-400">Order ID: #{order.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:hidden text-right">
                                        <p className="text-xl font-black text-white">${order.totalPrice.toFixed(2)}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase">{order.quantity} Units</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-zinc-600" />
                                        <div className="text-sm">
                                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">Acquired By</p>
                                            <p className="text-zinc-300 font-medium">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-zinc-600" />
                                        <div className="text-sm">
                                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">Comm Link</p>
                                            <p className="text-zinc-300 font-medium truncate max-w-[150px]">{order.customerEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-zinc-600" />
                                        <div className="text-sm">
                                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">Subspace Frequency</p>
                                            <p className="text-zinc-300 font-medium">{order.customerPhone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex flex-col items-end gap-1 min-w-[150px] border-l border-white/5 pl-6">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2">
                                    <CreditCard className="h-3 w-3" /> Quantum Total
                                </p>
                                <p className="text-3xl font-black text-white">${order.totalPrice.toFixed(2)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    <span className="text-[10px] text-zinc-500 font-medium uppercase">{order.quantity} Units Processed</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
