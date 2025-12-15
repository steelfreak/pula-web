import Header from "@/components/header"
import Footer from "@/components/footer"
import SearchInterface from "@/components/search-interface"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: "#ffffff" }}>
      <Header />
      <main className="flex-2">
        <SearchInterface />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
