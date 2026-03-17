import React from 'react'
import { HeroSection } from '../components/Home/HeroSection'
import { FeaturedProducts } from '../components/Home/FeaturedProducts'
import { CategoryGrid } from '../components/Home/CategoryGrid'
import { WhyChooseUs } from '../components/Home/WhyChooseUs'
import { Testimonials } from '../components/Home/Testimonials'
import { CTABanner } from '../components/Home/CTABanner'

export const HomePage: React.FC = () => {
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
