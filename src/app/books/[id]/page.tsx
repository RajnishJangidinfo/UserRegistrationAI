"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Save, X, Plus, Trash2, ChevronLeft, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { getBook, updateBook, CreateBookPayload, Book } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EditBookPage() {
    const router = useRouter()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState<CreateBookPayload>({
        title: "",
        subtitle: "",
        publisher: "",
        publishedDate: "",
        description: "",
        pageCount: 0,
        stockQuantity: 0,
        unitPrice: 0,
        printType: "BOOK",
        language: "en",
        thumbnailUrl: "",
        infoLink: "",
        authorNames: [""],
        categoryNames: [""]
    })

    useEffect(() => {
        async function fetchBook() {
            setLoading(true)
            const response = await getBook(parseInt(id as string))
            if (response.success) {
                const book: Book = response.data
                setFormData({
                    title: book.title || "",
                    subtitle: book.subtitle || "",
                    publisher: book.publisher || "",
                    publishedDate: book.publishedDate || "",
                    description: book.description || "",
                    pageCount: book.pageCount || 0,
                    printType: book.printType || "BOOK",
                    language: book.language || "en",
                    thumbnailUrl: book.thumbnailUrl || "",
                    infoLink: book.infoLink || "",
                    stockQuantity: book.stockQuantity || 0,
                    unitPrice: book.unitPrice || 0,
                    authorNames: (book.authorNames && book.authorNames.length > 0) ? book.authorNames : [""],
                    categoryNames: (book.categoryNames && book.categoryNames.length > 0) ? book.categoryNames : [""]
                })
            } else {
                setError(response.message)
            }
            setLoading(false)
        }
        fetchBook()
    }, [id])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: (name === "pageCount" || name === "stockQuantity")
                ? parseInt(value) || 0
                : name === "unitPrice"
                    ? parseFloat(value) || 0
                    : value
        }))
    }

    const handleArrayChange = (index: number, value: string, type: 'authorNames' | 'categoryNames') => {
        const newArray = [...formData[type]]
        newArray[index] = value
        setFormData(prev => ({ ...prev, [type]: newArray }))
    }

    const addArrayItem = (type: 'authorNames' | 'categoryNames') => {
        setFormData(prev => ({ ...prev, [type]: [...prev[type], ""] }))
    }

    const removeArrayItem = (index: number, type: 'authorNames' | 'categoryNames') => {
        if (formData[type].length > 1) {
            const newArray = [...formData[type]]
            newArray.splice(index, 1)
            setFormData(prev => ({ ...prev, [type]: newArray }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")

        // Filter out empty names
        const payload = {
            ...formData,
            authorNames: formData.authorNames.filter(n => n.trim() !== ""),
            categoryNames: formData.categoryNames.filter(n => n.trim() !== "")
        }

        const response = await updateBook(parseInt(id as string), payload)
        if (response.success) {
            router.push("/books")
        } else {
            setError(response.message)
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-black p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            <div className="max-w-4xl w-full relative z-10 animate-in fade-in zoom-in duration-500 py-12">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                                Update Record
                            </h1>
                            <p className="text-zinc-400 font-medium italic">Refining the galactic records for ID: {id}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="glass p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                            <div className="h-12 w-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                                <BookOpen className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Book Information</h3>
                                <p className="text-xs text-zinc-500">Modify the technical specs of this entry</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-gray-300">Title*</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        required
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subtitle" className="text-gray-300">Subtitle</Label>
                                    <Input
                                        id="subtitle"
                                        name="subtitle"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.subtitle}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="publisher" className="text-gray-300">Publisher</Label>
                                    <Input
                                        id="publisher"
                                        name="publisher"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.publisher}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="publishedDate" className="text-gray-300">Published Date</Label>
                                    <Input
                                        id="publishedDate"
                                        name="publishedDate"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.publishedDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pageCount" className="text-gray-300">Page Count</Label>
                                    <Input
                                        id="pageCount"
                                        name="pageCount"
                                        type="number"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.pageCount}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language" className="text-gray-300">Language</Label>
                                    <Input
                                        id="language"
                                        name="language"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unitPrice" className="text-gray-300">Unit Price ($)*</Label>
                                    <Input
                                        id="unitPrice"
                                        name="unitPrice"
                                        type="number"
                                        step="0.01"
                                        required
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.unitPrice}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stockQuantity" className="text-gray-300">Current Stock Quantity*</Label>
                                    <Input
                                        id="stockQuantity"
                                        name="stockQuantity"
                                        type="number"
                                        required
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.stockQuantity}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-300">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white p-4 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all placeholder:text-gray-500"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="grid gap-12 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-gray-300 font-bold tracking-wide">AUTHORS</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('authorNames')} className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-full">
                                            <Plus className="h-4 w-4 mr-1" /> Add Author
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.authorNames.map((name, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12 flex-1"
                                                    value={name}
                                                    onChange={(e) => handleArrayChange(i, e.target.value, 'authorNames')}
                                                    placeholder="Author Name"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeArrayItem(i, 'authorNames')}
                                                    disabled={formData.authorNames.length === 1}
                                                    className="h-12 w-12 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-gray-300 font-bold tracking-wide">CATEGORIES</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('categoryNames')} className="h-8 text-purple-400 hover:text-purple-300 hover:bg-white/5 rounded-full">
                                            <Plus className="h-4 w-4 mr-1" /> Add Category
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.categoryNames.map((name, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12 flex-1"
                                                    value={name}
                                                    onChange={(e) => handleArrayChange(i, e.target.value, 'categoryNames')}
                                                    placeholder="Category Name"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeArrayItem(i, 'categoryNames')}
                                                    disabled={formData.categoryNames.length === 1}
                                                    className="h-12 w-12 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="thumbnailUrl" className="text-gray-300">Thumbnail URL</Label>
                                    <Input
                                        id="thumbnailUrl"
                                        name="thumbnailUrl"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.thumbnailUrl}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="infoLink" className="text-gray-300">External Info Link</Label>
                                    <Input
                                        id="infoLink"
                                        name="infoLink"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                                        value={formData.infoLink}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-10 border-t border-white/10 mt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push("/books")}
                                    className="text-zinc-400 hover:text-white h-14 px-8"
                                >
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="premium"
                                    disabled={saving}
                                    className="h-14 px-12 text-lg"
                                >
                                    <Save className="mr-2 h-4 w-4" /> {saving ? "Updating..." : "Update Record"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
