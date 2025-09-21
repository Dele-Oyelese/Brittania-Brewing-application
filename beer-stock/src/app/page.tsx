import { Button } from '@/components/ui/button'
import { ArrowRight, Beer, Package, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-pattern text-white py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">
              Welcome to Britannia Brewing B2B Portal
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Order wholesale craft beer directly from Calgary's premier brewery.
              Exclusive access for licensed establishments.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/catalog">
                  Browse Catalog <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-britannia-cream">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Order Through Our B2B Portal?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Beer className="h-12 w-12 text-britannia-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fresh Inventory</h3>
              <p className="text-gray-600">
                Real-time stock levels ensure you always know what's available
              </p>
            </div>
            <div className="text-center">
              <Package className="h-12 w-12 text-britannia-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Ordering</h3>
              <p className="text-gray-600">
                Streamlined ordering process with automated confirmations
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-britannia-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
              <p className="text-gray-600">
                Direct access to our wholesale team for all your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Ordering?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Calgary's finest establishments in serving Britannia Brewing craft beer
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Create Account
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
