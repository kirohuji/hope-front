// 产品 ID 常量
const PRODUCT_IDS = {
  MONTHLY: 'lourd.jiamai.app.member_a_monthly',
  YEARLY: 'lourd.jiamai.app.member_a_yearly',
};

// 订阅状态
const subscriptionState = {
  isInitialized: false,
  products: [],
  currentSubscription: null,
  purchaseInProgress: false,
};

/**
 * 初始化 iOS 应用内购买
 * @returns {Promise<Array>} 返回可用的订阅产品列表
 */
export const getSubscriptions = async () => new Promise((resolve, reject) => {
    document.addEventListener('deviceready', async () => {
      if (!window.CdvPurchase) {
        console.error('CdvPurchase plugin not found');
        resolve([]);
        return;
      }
      console.log('window.CdvPurchase', window.CdvPurchase);

      const { store, Verbosity, ProductType, Platform: PurchasePlatform } = window.CdvPurchase;

      try {
        // 设置调试级别
        store.verbosity = Verbosity.DEBUG;

        // 注册产品
        const products = [
          {
            id: PRODUCT_IDS.MONTHLY,
            type: ProductType.PAID_SUBSCRIPTION,
            platform: PurchasePlatform.TEST,
          },
          {
            id: PRODUCT_IDS.YEARLY,
            type: ProductType.PAID_SUBSCRIPTION,
            platform: PurchasePlatform.TEST,
          },
        ];
        console.log('products', products);
        store.register(products);
        console.log('store', store);
        // 初始化商店
        await store.initialize([PurchasePlatform.TEST]);
        console.log('iOS 商店初始化成功');

        // 设置事件监听器
        setupStoreListeners(store);

        // 更新产品信息
        await store.update();
        
        // 更新状态
        subscriptionState.isInitialized = true;
        subscriptionState.products = store.products;

        resolve(store.products);
      } catch (error) {
        console.error('iOS 商店初始化失败:', error);
        reject(error);
      }
    });
  });

/**
 * 设置商店事件监听器
 * @param {Object} store - CdvPurchase store 实例
 */
const setupStoreListeners = (store) => {
  store
    .when()
    .productUpdated((product) => {
      console.log('产品更新:', product);
      // 更新产品状态
      updateProductState(product);
    })
    .approved((transaction) => {
      console.log('购买成功:', transaction.products[0].id);
      // 处理购买成功
      handlePurchaseSuccess(transaction);
    })
    .error((error) => {
      console.error('商店错误:', error);
      // 处理错误
      handleStoreError(error);
    });
};

/**
 * 更新产品状态
 * @param {Object} product - 产品对象
 */
const updateProductState = (product) => {
  const index = subscriptionState.products.findIndex(p => p.id === product.id);
  if (index !== -1) {
    subscriptionState.products[index] = product;
  }
};

/**
 * 处理购买成功
 * @param {Object} transaction - 交易对象
 */
const handlePurchaseSuccess = async (transaction) => {
  try {
    // 更新订阅状态
    subscriptionState.currentSubscription = transaction.products[0];
    
    // 完成交易
    await transaction.finish();
    
    // TODO: 调用后端 API 更新订阅状态
    // await updateSubscriptionOnServer(transaction);
    
    console.log('订阅状态已更新');
  } catch (error) {
    console.error('处理购买成功时出错:', error);
  }
};

/**
 * 处理商店错误
 * @param {Error} error - 错误对象
 */
const handleStoreError = (error) => {
  // TODO: 实现错误处理逻辑
  console.error('商店错误:', error);
};

/**
 * 获取当前订阅状态
 * @returns {Object} 订阅状态
 */
export const getSubscriptionState = () => ({ ...subscriptionState });

/**
 * 检查是否已订阅
 * @returns {boolean} 是否已订阅
 */
export const isSubscribed = () => subscriptionState.currentSubscription !== null;

/**
 * 购买订阅
 * @param {string} productId - 产品ID
 * @returns {Promise<Object>} 购买结果
 */
export const purchaseSubscription = async (productId) => {
  if (!window.CdvPurchase) {
    throw new Error('CdvPurchase plugin not found');
  }

  if (subscriptionState.purchaseInProgress) {
    throw new Error('已有购买正在进行中');
  }

  const { store } = window.CdvPurchase;
  
  try {
    subscriptionState.purchaseInProgress = true;
    
    // 获取产品
    const product = store.get(productId);
    if (!product) {
      throw new Error('产品不存在');
    }

    // 验证产品状态
    if (!await validateProduct(product)) {
      throw new Error('产品验证失败');
    }

    // 开始购买
    const order = await product.order();
    
    // 等待购买完成
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('购买超时'));
      }, 60000); // 60秒超时

      store
        .when()
        .approved((transaction) => {
          clearTimeout(timeout);
          resolve(transaction);
        })
        .error((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });

    // 验证收据
    if (!await validateReceipt(result)) {
      throw new Error('收据验证失败');
    }

    return result;
  } catch (error) {
    console.error('购买失败:', error);
    throw error;
  } finally {
    subscriptionState.purchaseInProgress = false;
  }
};

/**
 * 验证产品
 * @param {Object} product - 产品对象
 * @returns {Promise<boolean>} 验证结果
 */
const validateProduct = async (product) => {
  try {
    // 检查产品是否可用
    if (!product.valid) {
      console.error('产品不可用:', product);
      return false;
    }

    // 检查产品价格
    if (!product.price) {
      console.error('产品价格无效:', product);
      return false;
    }

    // 检查产品类型
    if (product.type !== window.CdvPurchase.ProductType.AUTO_RENEWABLE_SUBSCRIPTION) {
      console.error('产品类型错误:', product);
      return false;
    }

    return true;
  } catch (error) {
    console.error('产品验证失败:', error);
    return false;
  }
};

/**
 * 验证收据
 * @param {Object} transaction - 交易对象
 * @returns {Promise<boolean>} 验证结果
 */
const validateReceipt = async (transaction) => {
  try {
    // 获取收据数据
    const {receipt} = transaction;
    if (!receipt) {
      console.error('收据数据不存在');
      return false;
    }

    // TODO: 调用后端 API 验证收据
    // const validationResult = await validateReceiptWithServer(receipt);
    // return validationResult.valid;

    // 临时返回 true，实际应该调用后端验证
    return true;
  } catch (error) {
    console.error('收据验证失败:', error);
    return false;
  }
};

/**
 * 恢复购买
 * @returns {Promise<Array>} 恢复的购买列表
 */
export const restorePurchases = async () => {
  if (!window.CdvPurchase) {
    throw new Error('CdvPurchase plugin not found');
  }

  const { store } = window.CdvPurchase;

  try {
    // 开始恢复购买
    const restored = await store.refresh();
    
    // 验证恢复的购买
    const validatedTransactions = await Promise.all(
      restored.map(async (transaction) => {
        const isValid = await validateReceipt(transaction);
        if (isValid) {
          // 更新订阅状态
          subscriptionState.currentSubscription = transaction.products[0];
          await transaction.finish();
          return transaction;
        }
        return null;
      })
    );

    return validatedTransactions.filter(Boolean);
  } catch (error) {
    console.error('恢复购买失败:', error);
    throw error;
  }
};

/**
 * 检查订阅是否有效
 * @returns {Promise<boolean>} 订阅是否有效
 */
export const checkSubscriptionValidity = async () => {
  if (!subscriptionState.currentSubscription) {
    return false;
  }

  try {
    const { store } = window.CdvPurchase;
    
    // 刷新产品信息
    await store.update();
    
    // 获取当前订阅产品
    const product = store.get(subscriptionState.currentSubscription.id);
    if (!product) {
      return false;
    }

    // 验证产品
    if (!await validateProduct(product)) {
      return false;
    }

    // 验证收据
    return await validateReceipt(subscriptionState.currentSubscription);
  } catch (error) {
    console.error('检查订阅有效性失败:', error);
    return false;
  }
};
