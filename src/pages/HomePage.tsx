import React from 'react'
import { useSEO } from '../hooks/useSEO'
import { HeroSection } from '../components/Home/HeroSection'
import { FeaturedProducts } from '../components/Home/FeaturedProducts'
import { CategoryGrid } from '../components/Home/CategoryGrid'
import { WhyChooseUs } from '../components/Home/WhyChooseUs'
import { Testimonials } from '../components/Home/Testimonials'
import { CTABanner } from '../components/Home/CTABanner'

export const HomePage: React.FC = () => {
  useSEO({
    title: 'ZoltMount — Premium TV Mounts & Wall Brackets',
    description: 'Professional-grade TV mounts and wall brackets. 5-year warranty, global shipping to 50+ countries. Trusted by 500,000+ customers.',
    canonical: '/',
  })

  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <CategoryGrid />
      <WhyChooseUs />
      <Testimonials />
      <CTABanner />
    </>
  )
}
