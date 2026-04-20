import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { getProduct, updateProduct } from '../services/api';
import { Product } from '../types/product';
import { ProductFormData } from '../components/features/products/product-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { PRODUCT_LABELS } from '../localization/constants/product-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (id) {
        const fetchedProduct = await getProduct(parseInt(id, 10));
        setProduct(fetchedProduct);
      }
    } catch (err) {
      setError(MESSAGE_FORMATTER.ERROR_FETCH(`${PRODUCT_LABELS.PRODUCT}情報`));
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      if (id) {
        await updateProduct(parseInt(id, 10), data);
        navigate('/products');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <ErrorMessage
        message={error || MESSAGE_FORMATTER.ERROR_NOT_FOUND(PRODUCT_LABELS.PRODUCT)}
        retry={fetchProduct}
      />
    );
  }

  return (
    <FormWrapper
      title={`${PRODUCT_LABELS.PRODUCT}${ACTION_LABELS.EDIT}`}
      description={`${PRODUCT_LABELS.PRODUCT}情報を編集します`}
    >
      <ProductForm initialData={product} onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? MESSAGE_FORMATTER.UPDATING() : ACTION_LABELS.UPDATE}
          </Button>
        </div>
      </ProductForm>
    </FormWrapper>
  );
};

export default ProductEditPage;