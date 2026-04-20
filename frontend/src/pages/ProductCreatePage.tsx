import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { createProduct } from '../services/api';
import { ProductFormData } from '../components/features/products/product-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { PRODUCT_LABELS } from '../localization/constants/product-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      await createProduct(data);
      navigate('/products');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <FormWrapper
      title={`${ACTION_LABELS.CREATE_NEW}${PRODUCT_LABELS.PRODUCT}`}
      description={`新しい${PRODUCT_LABELS.PRODUCT}を作成します`}
    >
      <ProductForm onSubmit={handleSubmit}>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? MESSAGE_FORMATTER.CREATING() : ACTION_LABELS.CREATE}
          </Button>
        </div>
      </ProductForm>
    </FormWrapper>
  );
};

export default ProductCreatePage;