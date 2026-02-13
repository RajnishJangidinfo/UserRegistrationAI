"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Plus, Search, Trash2, Edit, ExternalLink, AlertCircle, ShoppingCart, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { ImageTooltip } from "@/components/ui/image-tooltip"
import { getBooks, deleteBook, Book } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/CartContext"
import { isAdminOrAbove } from "@/lib/auth"

export default function BooksPage() {
    const router = useRouter()
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const { addToCart } = useCart()
    const [canManageBooks, setCanManageBooks] = useState(false)

    useEffect(() => {
        // Check if user can manage books (Admin or SuperAdmin)
        setCanManageBooks(isAdminOrAbove())
    }, [])

    const fetchBooks = async () => {
        setLoading(true)
        const response = await getBooks()
        if (response.success) {
            setBooks(response.data || [])
        } else {
            setError(response.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this book?")) {
            const response = await deleteBook(id)
            if (response.success) {
                fetchBooks()
            } else {
                alert(response.message)
            }
        }
    }

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.authorNames || []).some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-black relative overflow-hidden">
            {/* Enhanced Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-purple-500/15 blur-[150px] animate-pulse" />
                <div className="absolute top-[50%] -right-[15%] w-[50%] h-[50%] rounded-full bg-indigo-500/15 blur-[130px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            <div className="relative z-10 p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 w-fit group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
                </Button>

                {/* Header Section with improved typography */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 drop-shadow-lg">
                            Book Library
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-300 font-medium">
                            Manage your collection of intergalactic knowledge
                        </p>
                        <p className="text-sm text-zinc-500">
                            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} available
                        </p>
                    </div>

                    {/* Search and Add Section */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input
                                placeholder="Search books or authors..."
                                className="pl-12 h-12 glass border-white/10 text-white placeholder:text-zinc-500 text-base focus:border-purple-500/50 focus:ring-purple-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {canManageBooks && (
                            <Button
                                onClick={() => router.push("/books/add")}
                                size="lg"
                                className="h-12 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-xl shadow-purple-500/30 font-semibold text-base transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Add Book
                            </Button>
                        )}
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="glass border border-red-500/20 bg-red-500/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                            <p className="text-red-200 font-medium text-base">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-16">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                        <p className="text-zinc-400 mt-4 text-lg font-medium">Loading books...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredBooks.length === 0 && (
                    <div className="text-center py-20 glass rounded-3xl border-white/5 backdrop-blur-xl">
                        <BookOpen className="h-20 w-20 text-zinc-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3">No books found</h3>
                        <p className="text-zinc-400 text-lg mb-6">
                            {searchTerm ? "Try adjusting your search" : "Start by adding a new book to your collection!"}
                        </p>
                        {!searchTerm && (
                            <Button
                                onClick={() => router.push("/books/add")}
                                size="lg"
                                variant="premium"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Add Your First Book
                            </Button>
                        )}
                    </div>
                )}

                {/* Books Grid with Enhanced Cards */}
                {!loading && !error && filteredBooks.length > 0 && (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredBooks.map((book) => (
                            <Card key={book.id} className="glass border-white/10 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden backdrop-blur-xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                                <CardContent className="p-0">
                                    {/* Large Book Cover Image */}
                                    <div className="relative w-full h-72 bg-gradient-to-br from-zinc-900 to-zinc-800 overflow-hidden">
                                        {book.thumbnailUrl ? (
                                            <ImageTooltip
                                                src={book.thumbnailUrl}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-800 to-zinc-900">
                                                <BookOpen className="h-20 w-20 text-zinc-700" />
                                            </div>
                                        )}
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Stock indicator */}
                                        <div className="absolute top-3 right-3">
                                            {(book.stockQuantity || 0) > 0 ? (
                                                <span className="px-3 py-1.5 bg-green-500/20 backdrop-blur-sm text-green-300 text-xs font-bold rounded-full border border-green-500/30">
                                                    {book.stockQuantity} in stock
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-red-500/20 backdrop-blur-sm text-red-300 text-xs font-bold rounded-full border border-red-500/30">
                                                    Sold Out
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Book Details */}
                                    <div className="p-5 space-y-4">
                                        {/* Title and Author */}
                                        <div className="space-y-2">
                                            <CardTitle className="text-xl font-bold text-white line-clamp-2 group-hover:text-indigo-300 transition-colors leading-tight">
                                                {book.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm text-zinc-400 font-medium line-clamp-1">
                                                {(book.authorNames || []).join(", ") || "Unknown Author"}
                                            </CardDescription>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                                            {book.description || "No description available."}
                                        </p>

                                        {/* Category and Price */}
                                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                                            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                                                {(book.categoryNames || [])[0] || "General"}
                                            </span>
                                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                                ${(book.unitPrice || 0).toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 pt-3">
                                            {canManageBooks && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200"
                                                        onClick={() => router.push(`/books/${book.id}`)}
                                                        title="Edit book"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                                                        onClick={() => handleDelete(book.id)}
                                                        title="Delete book"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            <Button
                                                variant="premium"
                                                size="sm"
                                                className="flex-1 h-10 font-semibold text-sm"
                                                onClick={() => addToCart(book)}
                                                disabled={(book.stockQuantity || 0) <= 0}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                {(book.stockQuantity || 0) > 0 ? "Add to Cart" : "Sold Out"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
