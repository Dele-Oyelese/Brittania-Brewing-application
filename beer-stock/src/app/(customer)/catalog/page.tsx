import { BeerCard } from '@/components/beer/BeerCard'
import { createServerClient } from '@/lib/supabase/server'
import { Beer } from '@/types'

export default async function CatalogPage() {
  const supabase = createServerClient()

  const { data: beers, error } = await supabase
    .from('beers')
    .select(`
      *,
      pricing:beer_pricing(*)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching beers:', error)
    return <div>Error loading catalog</div>
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Beer Catalog</h1>
        <p className="text-gray-600 mt-2">
          Browse our selection of craft beers available for wholesale
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beers?.map((beer: Beer) => (
          <BeerCard key={beer.id} beer={beer} />
        ))}
      </div>
    </div>
  )
}
