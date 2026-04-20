// src/pages/DeviceProductSettingsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/page-header';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import DeviceProductAssociation from '../components/DeviceProductAssociation';
import { DeviceProductAssociation as DeviceProductAssociationType } from '../types/deviceProductAssociation';
import { getProductsWithCustomers, addProductToDevice, removeProductFromDevice, getProducts } from '../services/api';
import { ProductWithCustomer } from '../types/product';
import { BUSINESS_TERMS } from '../localization/constants/business-terms';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const DeviceProductSettingsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [products, setProducts] = useState<DeviceProductAssociationType[]>([]);
  const [availableProducts, setAvailableProducts] = useState<DeviceProductAssociationType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchAvailableProducts();
  }, [deviceId]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProductsWithCustomers(parseInt(deviceId!));
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError(MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.PRODUCTS));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const allProducts = await getProducts();
      // ProductWithCustomer[] を DeviceProductAssociation[] に変換
      const convertedProducts: DeviceProductAssociationType[] = allProducts.map((product: ProductWithCustomer) => ({
        id: product.id,
        device_id: parseInt(deviceId!),
        product_id: product.id,
        internal_product_number: product.internal_product_number,
        customer_product_number: product.customer_product_number,
        product_name: product.product_name,
        customer_name: product.customer.name
      }));
      setAvailableProducts(convertedProducts);
    } catch (error) {
      console.error('Failed to fetch available products:', error);
      setError(`利用可能な${BUSINESS_TERMS.PRODUCTS}の取得に失敗しました`);
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    try {
      await removeProductFromDevice(parseInt(deviceId!), productId);
      await fetchProducts();
      await fetchAvailableProducts();
    } catch (error) {
      console.error('Failed to remove product:', error);
      setError(`${BUSINESS_TERMS.PRODUCT}の削除に失敗しました`);
    }
  };

  const handleAddProducts = async (productIds: number[]) => {
    try {
      for (const productId of productIds) {
        await addProductToDevice(parseInt(deviceId!), productId);
      }
      await fetchProducts();
      await fetchAvailableProducts();
    } catch (error) {
      console.error('Failed to add products:', error);
      setError(`${BUSINESS_TERMS.PRODUCTS}の追加に失敗しました`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchProducts} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${BUSINESS_TERMS.PRODUCT}${BUSINESS_TERMS.SETTINGS}`}
        description={`${BUSINESS_TERMS.DEVICE}と${BUSINESS_TERMS.PRODUCT}の関連付けを管理します`}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: `${BUSINESS_TERMS.DEVICE} ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: `${BUSINESS_TERMS.DETAILS}${BUSINESS_TERMS.SETTINGS}`, href: `/devices/${deviceId}/detail-settings` },
          { label: `${BUSINESS_TERMS.PRODUCT}${BUSINESS_TERMS.SETTINGS}` },
        ]}
      />
      <DeviceProductAssociation
        products={products}
        availableProducts={availableProducts}
        onRemoveProduct={handleRemoveProduct}
        onAddProducts={handleAddProducts}
      />
    </div>
  );
};

export default DeviceProductSettingsPage;
