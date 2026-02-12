"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingCart, User, Mail, Phone, Package, ChevronLeft, CreditCard, CheckCircle2, AlertCircle } from "lucide-react"
import { getBook, createOrder, Book } from "@/lib/api"
import { useCart } from "@/context/CartContext"

export default function CreateOrderPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const bookIdParam = searchParams.get("bookId")
    const { cart, totalPrice, clearCart, addToCart } = useCart()

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const initCheckout = async () => {
            if (bookIdParam && cart.length === 0) {
                // Quick Buy scenario
                const response = await getBook(parseInt(bookIdParam))
                if (response.success) {
                    addToCart(response.data)
                } else {
                    setError("Book details could not be retrieved.")
                }
            } else if (cart.length === 0 && !bookIdParam) {
                setError("No books selected for purchase.")
            }
            setFetching(false)
        }
        initCheckout()
    }, [bookIdParam, cart.length])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cart.length === 0) {
            setError("Your cart is empty.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const payload = {
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                items: cart.map(item => ({
                    bookId: item.id,
                    quantity: item.quantity
                }))
            }

            const response = await createOrder(payload)

            if (response.success) {
                setSuccess(true)
                clearCart()
            } else {
                setError(response.message)
            }
        } catch (err: any) {
            setError(err.message || "Checkout failed.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4">
                <div className="glass max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                    <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                        <CheckCircle2 className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
                    <p className="text-gray-300 mb-8">
                        The galactic transaction was successful. The archives have been updated and your collection is growing.
                    </p>
                    <div className="w-full space-y-3">
                        <Button onClick={() => router.push("/orders")} className="w-full" variant="premium">
                            View Orders History
                        </Button>
                        <Button onClick={() => router.push("/books")} className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white">
                            Return to Library
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-black p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            <div className="max-w-xl w-full relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="mb-8 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                            Checkout
                        </h1>
                        <p className="text-zinc-400 font-medium italic">Acquiring precious intergalactic knowledge.</p>
                    </div>
                </div>

                {fetching ? (
                    <div className="glass p-12 text-center text-zinc-400 rounded-2xl border-white/5">
                        Initiating quantum handshake...
                    </div>
                ) : cart.length === 0 && error ? (
                    <div className="glass p-12 text-center rounded-2xl border-white/10 space-y-6">
                        <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 underline decoration-red-500/50 underline-offset-8">Quantum Anomaly</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto text-sm italic">{error}</p>
                        </div>
                        <Button
                            onClick={() => router.push("/books")}
                            variant="premium"
                            className="w-full h-12"
                        >
                            Return to Library
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="glass p-6 rounded-2xl border-white/10 space-y-4">
                            <h3 className="text-white font-bold text-lg border-b border-white/5 pb-2">Order Summary</h3>
                            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="h-12 w-10 bg-zinc-900 rounded overflow-hidden flex-shrink-0">
                                            {item.thumbnailUrl ? (
                                                <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                    <Package size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white text-sm font-bold line-clamp-1">{item.title}</h4>
                                            <p className="text-zinc-500 text-[10px]">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                                        </div>
                                        <span className="text-indigo-400 text-sm font-bold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName" className="text-gray-300">Customer Full Name</Label>
                                    <Input
                                        id="customerName"
                                        name="customerName"
                                        required
                                        icon={<User className="h-4 w-4" />}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        placeholder="Arrakis Explorer"
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerEmail" className="text-gray-300">Galactic ID (Email)</Label>
                                        <Input
                                            id="customerEmail"
                                            name="customerEmail"
                                            type="email"
                                            required
                                            icon={<Mail className="h-4 w-4" />}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10"
                                            value={formData.customerEmail}
                                            onChange={handleInputChange}
                                            placeholder="explorer@universe.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone" className="text-gray-300">Comm Channel (Phone)</Label>
                                        <Input
                                            id="customerPhone"
                                            name="customerPhone"
                                            required
                                            icon={<Phone className="h-4 w-4" />}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10"
                                            value={formData.customerPhone}
                                            onChange={handleInputChange}
                                            placeholder="+1-234-567-890"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                <div className="text-zinc-400">
                                    <p className="text-[10px] uppercase tracking-widest">Total Valuation</p>
                                    <p className="text-3xl font-extrabold text-white mt-1">
                                        ${totalPrice.toFixed(2)}
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    variant="premium"
                                    disabled={loading || cart.length === 0}
                                    className="h-14 px-10 text-lg shadow-indigo-500/20"
                                >
                                    {loading ? "Decrypting..." : "Confirm Purchase"}
                                    <CreditCard className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
