import Layout from '@/components/layout/Layout';

export default function DebugPage() {
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold text-primary-600 mb-6">Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Testing Tailwind Styles</h2>
            <p className="text-gray-600 mb-4">This page tests if Tailwind CSS styles are correctly applied.</p>
            
            <div className="flex flex-col space-y-4">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-accent">Accent Button</button>
              <button className="btn-outline">Outline Button</button>
            </div>
          </div>
          
          <div className="bg-primary-50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary-800 mb-4">Color Palette</h2>
            <div className="grid grid-cols-5 gap-2">
              <div className="h-10 bg-primary-100 rounded"></div>
              <div className="h-10 bg-primary-300 rounded"></div>
              <div className="h-10 bg-primary-500 rounded"></div>
              <div className="h-10 bg-primary-700 rounded"></div>
              <div className="h-10 bg-primary-900 rounded"></div>
              
              <div className="h-10 bg-secondary-100 rounded"></div>
              <div className="h-10 bg-secondary-300 rounded"></div>
              <div className="h-10 bg-secondary-500 rounded"></div>
              <div className="h-10 bg-secondary-700 rounded"></div>
              <div className="h-10 bg-secondary-900 rounded"></div>
              
              <div className="h-10 bg-accent-100 rounded"></div>
              <div className="h-10 bg-accent-300 rounded"></div>
              <div className="h-10 bg-accent-500 rounded"></div>
              <div className="h-10 bg-accent-700 rounded"></div>
              <div className="h-10 bg-accent-900 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 