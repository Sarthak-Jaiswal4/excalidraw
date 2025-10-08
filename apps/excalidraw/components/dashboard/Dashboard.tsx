'use client'
import React from 'react'
import ProjectSection from './ProjectCard'
import Header from '../ui/Header'
import HomeSidebar from '../HomeSidebar'

function Dashboard() {
  return (
    <>  
      <div className='flex w-full h-full'>
        <HomeSidebar />
        <div className='flex flex-col w-full'>
          <Header />
          <ProjectSection />
        </div>
      </div>
    </>
  )
}

export default Dashboard