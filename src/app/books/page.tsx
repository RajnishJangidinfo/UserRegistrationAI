"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Plus, Search, Trash2, Edit, ExternalLink, AlertCircle, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { getBooks, deleteBook, Book } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/CartContext"

export default function BooksPage() {
    const router = useRouter()
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const { addToCart } = useCart()

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
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Library</h2>
                    <p className="text-zinc-400">Manage your collection of intergalactic knowledge.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search books or authors..."
                            className="pl-10 glass border-0 text-white placeholder:text-zinc-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => router.push("/books/add")}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Book
                    </Button>
                </div>
            </div>

            {loading && (
                <div className="text-center text-zinc-400 py-12">
                    Scanning records...
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                </div>
            )}

            {!loading && !error && filteredBooks.length === 0 && (
                <div className="text-center text-zinc-400 py-12 glass rounded-2xl border-white/5">
                    No books found. Start by adding a new one!
                </div>
            )}

            {!loading && !error && filteredBooks.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredBooks.map((book) => (
                        <Card key={book.id} className="glass border-0 hover:bg-white/10 transition-all duration-300 group overflow-hidden flex flex-col">
                            <div className="aspect-[2/3] relative overflow-hidden bg-zinc-900/50">
                                {book.thumbnailUrl ? (
                                    <img
                                        src={book.thumbnailUrl}
                                        alt={book.title}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <BookOpen className="h-12 w-12 text-zinc-800" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                                <div className="absolute top-2 right-2 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <Button
                                        variant="glass"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-white/20"
                                        onClick={() => router.push(`/books/${book.id}`)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="glass"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-red-500/50"
                                        onClick={() => handleDelete(book.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                                    {book.title}
                                </CardTitle>
                                <CardDescription className="text-xs text-zinc-400 line-clamp-1">
                                    {(book.authorNames || []).join(", ")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-between gap-4">
                                <p className="text-xs text-zinc-500 line-clamp-3 italic">
                                    {book.description || "No description available."}
                                </p>
                                <div className="flex items-center justify-between mt-auto gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-medium px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit mb-1">
                                            {(book.categoryNames || [])[0] || "General"}
                                        </span>
                                        <span className="text-sm font-black text-white">$ {(book.unitPrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="premium"
                                            size="sm"
                                            className="h-8 text-[10px] px-3 font-bold"
                                            onClick={() => addToCart(book)}
                                            disabled={(book.stockQuantity || 0) <= 0}
                                        >
                                            <ShoppingCart className="h-3 w-3 mr-1" /> {(book.stockQuantity || 0) > 0 ? "Add to Cart" : "Sold Out"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
