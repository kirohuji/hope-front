import { useCallback } from 'react';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import {
  gotoStep,
  nextStep,
  backStep,
  addToCart,
  resetCart,
  deleteCart,
  createBilling,
  applyDiscount,
  applyShipping,
  increaseQuantity,
  decreaseQuantity,
} from 'src/redux/slices/checkout';
// _mock
import { PRODUCT_CHECKOUT_STEPS } from 'src/_mock/_product';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function useCheckout() {
  const dispatch = useDispatch();

  const router = useRouter();

  const checkout = useSelector((state) => state.checkout);

  const completed = checkout.activeStep === PRODUCT_CHECKOUT_STEPS.length;

  const onNextStep = useCallback(() => {
    dispatch(nextStep());
  }, [dispatch]);

  const onBackStep = useCallback(() => {
    dispatch(backStep());
  }, [dispatch]);

  const onGotoStep = useCallback(
    (step) => {
      dispatch(gotoStep(step));
    },
    [dispatch]
  );

  const onDeleteCart = useCallback(
    (productId) => {
      dispatch(deleteCart(productId));
    },
    [dispatch]
  );

  const onIncreaseQuantity = useCallback(
    (productId) => {
      dispatch(increaseQuantity(productId));
    },
    [dispatch]
  );

  const onDecreaseQuantity = useCallback(
    (productId) => {
      dispatch(decreaseQuantity(productId));
    },
    [dispatch]
  );

  const onCreateBilling = useCallback(
    (address) => {
      dispatch(createBilling(address));
      dispatch(nextStep());
    },
    [dispatch]
  );

  const onResetBilling = useCallback(() => {
    dispatch(createBilling(null));
  }, [dispatch]);

  const onAddCart = useCallback(
    (newProduct) => {
      dispatch(addToCart(newProduct));
    },
    [dispatch]
  );

  const onApplyDiscount = useCallback(
    (value) => {
      if (checkout.cart.length) {
        dispatch(applyDiscount(value));
      }
    },
    [checkout.cart.length, dispatch]
  );

  const onApplyShipping = useCallback(
    (value) => {
      dispatch(applyShipping(value));
    },
    [dispatch]
  );

  const onResetAll = useCallback(() => {
    if (completed) {
      dispatch(resetCart());
      router.replace(paths.product.root);
    }
  }, [completed, dispatch, router]);

  return {
    checkout,
    completed,
    //
    onResetAll,
    onAddCart,
    onGotoStep,
    onNextStep,
    onBackStep,
    onDeleteCart,
    onResetBilling,
    onCreateBilling,
    onApplyDiscount,
    onApplyShipping,
    onIncreaseQuantity,
    onDecreaseQuantity,
  };
}
