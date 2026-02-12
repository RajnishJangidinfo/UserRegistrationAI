"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Book } from "@/lib/api";

export interface CartItem extends Book {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (book: Book, quantity?: number) => void;
    removeFromCart: (bookId: number) => void;
    updateQuantity: (bookId: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from localStorage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (book: Book, quantity: number = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === book.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === book.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevCart, { ...book, quantity }];
        });
    };

    const removeFromCart = (bookId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== bookId));
    };

    const updateQuantity = (bookId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(bookId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) => (item.id === bookId ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
