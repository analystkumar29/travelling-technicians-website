import BrandPage from '@/pages/brands/[slug]';
import { getBrandWithModels } from '@/lib/data-service';
import { GetStaticProps } from 'next';

export default BrandPage;

export const getStaticProps: GetStaticProps = async () => {
  const data = await getBrandWithModels('google');

  if (!data || data.deviceTypeGroups.length === 0) {
    return { notFound: true };
  }

  return {
    props: {
      brand: data.brand,
      deviceTypeGroups: data.deviceTypeGroups,
      testimonials: data.testimonials,
    },
    revalidate: 3600,
  };
};
