"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle } from "lucide-react";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
    const router = useRouter();

    if (cart.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="h-24 w-24 bg-zinc-900/50 rounded-full flex items-center justify-center border border-white/5 shadow-2xl">
                    <ShoppingBag className="h-10 w-10 text-zinc-600" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
                    <p className="text-zinc-500 max-w-xs mx-auto text-sm italic">
                        It looks like you haven't added any books to your collection yet.
                    </p>
                </div>
                <Button
                    variant="premium"
                    onClick={() => router.push("/books")}
                    className="px-8 h-12"
                >
                    Explore Library
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white tracking-tight">Shopping Cart</h1>
                <span className="text-zinc-500 text-sm font-medium">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <Card key={item.id} className="glass border-0 overflow-hidden group hover:bg-white/5 transition-all">
                            <CardContent className="p-0 flex items-center h-32">
                                <div className="w-24 h-full bg-zinc-900 flex-shrink-0 relative overflow-hidden">
                                    {item.thumbnailUrl ? (
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={item.title}
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <ShoppingBag className="h-8 w-8 text-zinc-800" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-white font-bold line-clamp-1">{item.title}</h3>
                                        <p className="text-zinc-500 text-[10px] mt-1 italic">
                                            {(item.authorNames || []).join(", ")}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-zinc-400 hover:text-white"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="text-sm font-bold text-white w-4 text-center">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-zinc-400 hover:text-white"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= (item.stockQuantity || 0)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-white font-bold text-sm">$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pr-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4">
                    <Card className="glass border-0 bg-indigo-500/5 sticky top-8">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-white">Order Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-zinc-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="text-white">$ {totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-400 text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-400 font-medium">Free</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between">
                                    <span className="text-white font-bold">Total</span>
                                    <span className="text-2xl font-black text-white">$ {totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                variant="premium"
                                className="w-full h-12 mt-4 shadow-xl shadow-indigo-500/20"
                                onClick={() => router.push("/orders/create")}
                            >
                                Checkout <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2 mt-4 text-[10px] text-zinc-500 justify-center italic">
                                <AlertCircle className="h-3 w-3" />
                                Secure quantum-encrypted transaction
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
