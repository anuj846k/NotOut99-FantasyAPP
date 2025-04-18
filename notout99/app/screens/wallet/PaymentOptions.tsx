import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft,  CheckCircle2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Bank {
  name: string;
  logo: string;
}

interface CardErrors {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'upi' | 'netbanking' | 'card';
  icon?: string;
}

const PaymentOptionsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'upi' | 'netbanking' | 'card' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const amount = Number(params.amount) || 0;
  const cashback = Number(params.cashback) || 0;
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardErrors, setCardErrors] = useState<CardErrors>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [useCoins, setUseCoins] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  
  const preferredPaymentMethods: PaymentMethod[] = [
    { id: 'paytm', name: 'Paytm UPI', type: 'upi' },
    { id: 'gpay', name: 'Google Pay', type: 'upi' },
    { id: 'phonepe', name: 'PhonePe', type: 'upi' },
    { id: 'icici', name: 'ICICI NetBanking', type: 'netbanking' },
    { id: 'hdfc', name: 'HDFC Credit Card', type: 'card' },
  ];

  const validateCardNumber = (value: string): boolean => {
    if (value.length > 0 && value.length < 10) {
      setCardErrors(prev => ({ ...prev, cardNumber: 'Card number must be at least 10 digits' }));
      return false;
    }
    setCardErrors(prev => ({ ...prev, cardNumber: '' }));
    return true;
  };

  const validateExpiryDate = (value: string): boolean => {
    const regex = /^\d{2}\/\d{2}$/;
    if (value.length > 0 && !regex.test(value)) {
      setCardErrors(prev => ({ ...prev, expiryDate: 'Format must be MM/YY' }));
      return false;
    }
    setCardErrors(prev => ({ ...prev, expiryDate: '' }));
    return true;
  };

  const validateCVV = (value: string): boolean => {
    if (value.length > 0 && value.length > 3) {
      setCardErrors(prev => ({ ...prev, cvv: 'CVV must be 3 digits or less' }));
      return false;
    }
    setCardErrors(prev => ({ ...prev, cvv: '' }));
    return true;
  };

  const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    
    return cleaned;
  };

  const handleExpiryChange = (value: string): void => {
    const formatted = formatExpiryDate(value);
    setExpiryDate(formatted);
    validateExpiryDate(formatted);
  };

  useEffect(() => {
    const loadUserCoins = async () => {
      try {
        const coinsStr = await AsyncStorage.getItem('userCoins');
        if (coinsStr) {
          setUserCoins(parseInt(coinsStr, 10));
        }
      } catch (error) {
        console.error('Error loading coins:', error);
      }
    };
    
    loadUserCoins();
  }, []);
  
  const requiredCoins = amount * 10;
  const hasEnoughCoins = userCoins >= requiredCoins;

  const handlePayment = async (): Promise<void> => {
    setIsLoading(true);
    
    if (useCoins) {
      try {
        const newBalance = userCoins - requiredCoins;
        await AsyncStorage.setItem('userCoins', newBalance.toString());
        
        const transaction = {
          amount: requiredCoins,
          type: 'debit',
          description: `Payment for ₹${amount}`,
          date: new Date().toLocaleString(),
        };
        
        const txHistoryStr = await AsyncStorage.getItem('coinsTransactions');
        const txHistory = txHistoryStr ? JSON.parse(txHistoryStr) : [];
        txHistory.unshift(transaction);
        
        await AsyncStorage.setItem('coinsTransactions', JSON.stringify(txHistory));
        
        setShowSnackbar(true);
        
        setTimeout(() => {
          setIsLoading(false);
          router.replace({
            pathname: '/screens/wallet/WalletScreen',
            params: { balanceUpdated: 'true', newBalance: amount }
          });
        }, 2000);
        
      } catch (error) {
        console.error('Error processing coin payment:', error);
        setIsLoading(false);
      }
    } else {
      // For now, just simulate payment success and add coins
      try {
        const currentCoinsStr = await AsyncStorage.getItem('userCoins');
        const currentCoins = currentCoinsStr ? parseInt(currentCoinsStr, 10) : 0;
        const coinsToAdd = amount * 2; // ₹1 = 2 coins
        
        await AsyncStorage.setItem('userCoins', (currentCoins + coinsToAdd).toString());
        
        const transaction = {
          amount: coinsToAdd,
          type: 'credit',
          description: `Added ${coinsToAdd} coins for ₹${amount}`,
          date: new Date().toLocaleString(),
        };
        
        const txHistoryStr = await AsyncStorage.getItem('coinsTransactions');
        const txHistory = txHistoryStr ? JSON.parse(txHistoryStr) : [];
        txHistory.unshift(transaction);
        await AsyncStorage.setItem('coinsTransactions', JSON.stringify(txHistory));
      } catch (error) {
        console.error('Error adding coins:', error);
      }

      setShowSnackbar(true);
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/screens/wallet/CoinsScreen');
      }, 2000);
    }
  };

  const banks: Bank[] = [
    { 
      name: 'ICICI', 
      logo: 'https://i.pinimg.com/736x/ff/d5/31/ffd531a6a78464512a97848e14506738.jpg' 
    },
    { 
      name: 'HDFC', 
      logo: 'https://w7.pngwing.com/pngs/347/43/png-transparent-hdfc-bank-logo-indian-bank.png' 
    },
    { 
      name: 'SBI', 
      logo: 'https://discovertemplate.com/wp-content/uploads/2024/04/SBI.jpg' 
    },
    { 
      name: 'AXIS', 
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMOsPhd3n8q7_sQMQjpaGpzTgbmB4chR5Jkg&s' 
    }
  ];

  const upiOptions = [
    { id: 'paytm', name: 'Paytm' },
    { id: 'gpay', name: 'Google Pay' },
    { id: 'phonepe', name: 'PhonePe' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Options</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.summaryHeader}>
            <Text style={styles.sectionTitle}>PAYMENT SUMMARY</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Added Cash</Text>
              <Text style={styles.summaryValue}>₹{amount}</Text>
            </View>
            {selectedPayment && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Selected Payment</Text>
                <Text style={styles.summaryValue}>{selectedPayment}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cashback</Text>
              <Text style={styles.summaryValueGreen}>₹{cashback}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
                     <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>₹{amount}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PREFERRED PAYMENT METHODS</Text>
          </View>
          <View style={styles.preferredPaymentsList}>
            {preferredPaymentMethods.map((method) => (
              <TouchableOpacity 
                key={method.id} 
                style={[
                  styles.preferredPaymentItem,
                  selectedPayment === method.id && styles.selectedPaymentItem
                ]}
                onPress={() => {
                  setSelectedPayment(method.id);
                  setSelectedPaymentType(method.type);
                }}
              >
                <View style={styles.preferredPaymentLeft}>
                  <Text style={styles.preferredPaymentLabel}>{method.name}</Text>
                  <Text style={styles.preferredPaymentType}>{method.type === 'upi' ? 'UPI' : method.type === 'netbanking' ? 'Net Banking' : 'Card'}</Text>
                </View>
                {selectedPayment === method.id && (
                  <CheckCircle2 size={20} color="#38A169" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.paymentTypeSelector}>
            <TouchableOpacity 
              style={[
                styles.paymentTypeOption,
                selectedPaymentType === 'upi' && styles.selectedPaymentType
              ]}
              onPress={() => setSelectedPaymentType('upi')}
            >
              <Text style={styles.paymentTypeText}>UPI</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.paymentTypeOption,
                selectedPaymentType === 'netbanking' && styles.selectedPaymentType
              ]}
              onPress={() => setSelectedPaymentType('netbanking')}
            >
              <Text style={styles.paymentTypeText}>Net Banking</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.paymentTypeOption,
                selectedPaymentType === 'card' && styles.selectedPaymentType
              ]}
              onPress={() => setSelectedPaymentType('card')}
            >
              <Text style={styles.paymentTypeText}>Card</Text>
            </TouchableOpacity>
          </View>

          {selectedPaymentType === 'upi' && (
            <View style={styles.paymentTypeContent}>
              <Text style={styles.paymentTypeTitle}>Select UPI App</Text>
              <View style={styles.upiOptions}>
                {upiOptions.map((upi) => (
                  <TouchableOpacity 
                    key={upi.id}
                    style={[
                      styles.upiOption,
                      selectedPayment === upi.id && styles.selectedUpiOption
                    ]}
                    onPress={() => setSelectedPayment(upi.id)}
                  >
                    <View style={styles.upiLogo}>
                      <Text style={styles.upiLogoText}>{upi.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.upiText}>{upi.name}</Text>
                    {selectedPayment === upi.id && (
                      <CheckCircle2 size={16} color="#38A169" style={styles.upiCheckmark} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedPaymentType === 'netbanking' && (
            <View style={styles.paymentTypeContent}>
              <Text style={styles.paymentTypeTitle}>Select Bank</Text>
              <View style={styles.bankOptions}>
                {banks.map((bank, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.bankOption,
                      selectedPayment === bank.name.toLowerCase() && styles.selectedBankOption
                    ]}
                    onPress={() => setSelectedPayment(bank.name.toLowerCase())}
                  >
                    <View style={styles.bankLogo}>
                      <Image source={{ uri: bank.logo }} style={styles.bankLogoImage} resizeMode="contain" />
                    </View>
                    <Text style={styles.bankText}>{bank.name}</Text>
                    {selectedPayment === bank.name.toLowerCase() && (
                      <CheckCircle2 size={16} color="#38A169" style={styles.bankCheckmark} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedPaymentType === 'card' && (
            <View style={styles.paymentTypeContent}>
              <Text style={styles.paymentTypeTitle}>Enter Card Details</Text>
              <View style={styles.cardForm}>
                <View>
                  <TextInput
                    style={[styles.input, cardErrors.cardNumber ? styles.inputError : null]}
                    placeholder="Card Number"
                    keyboardType="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChangeText={(text: string) => {
                      const cleaned = text.replace(/\D/g, '');
                      setCardNumber(cleaned);
                      if (cleaned.length > 0) {
                        setSelectedPayment('card');
                      }
                    }}
                    onBlur={() => validateCardNumber(cardNumber)}
                  />
                  {cardErrors.cardNumber ? <Text style={styles.errorText}>{cardErrors.cardNumber}</Text> : null}
                </View>
                
                <View style={styles.cardRow}>
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={[styles.input, cardErrors.expiryDate ? styles.inputError : null]}
                      placeholder="Expiry (MM/YY)"
                      value={expiryDate}
                      maxLength={5}
                      keyboardType="numeric"
                      onChangeText={handleExpiryChange}
                      onBlur={() => validateExpiryDate(expiryDate)}
                    />
                    {cardErrors.expiryDate ? <Text style={styles.errorText}>{cardErrors.expiryDate}</Text> : null}
                  </View>
                  
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={[styles.input, cardErrors.cvv ? styles.inputError : null]}
                      placeholder="CVV"
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={3}
                      value={cvv}
                      onChangeText={(text: string) => {
                        const cleaned = text.replace(/\D/g, '');
                        setCvv(cleaned);
                      }}
                      onBlur={() => validateCVV(cvv)}
                    />
                    {cardErrors.cvv ? <Text style={styles.errorText}>{cardErrors.cvv}</Text> : null}
                  </View>
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Name on Card"
                  value={nameOnCard}
                  onChangeText={setNameOnCard}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay with Coins</Text>
          <View style={styles.coinsPaymentOption}>
            <View style={styles.coinsInfo}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2933/2933116.png' }} 
                style={styles.coinIcon} 
              />
              <View>
                <Text style={styles.coinsBalanceText}>Your Balance: {userCoins} coins</Text>
                <Text style={styles.coinsRequiredText}>
                  Required: {requiredCoins} coins
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.useCoinsButton, 
                (!hasEnoughCoins || useCoins) && styles.useCoinsButtonDisabled
              ]}
              onPress={() => setUseCoins(true)}
              disabled={!hasEnoughCoins || useCoins}
            >
              <Text style={styles.useCoinsButtonText}>
                {useCoins ? 'Selected' : hasEnoughCoins ? 'Use Coins' : 'Not Enough Coins'}
              </Text>
            </TouchableOpacity>
            
            {useCoins && (
              <TouchableOpacity 
                style={styles.cancelCoinsButton}
                onPress={() => setUseCoins(false)}
              >
                <Text style={styles.cancelCoinsButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!useCoins && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PREFERRED PAYMENT METHODS</Text>
            </View>
            <View style={styles.preferredPaymentsList}>
              {preferredPaymentMethods.map((method) => (
                <TouchableOpacity 
                  key={method.id} 
                  style={[
                    styles.preferredPaymentItem,
                    selectedPayment === method.id && styles.selectedPaymentItem
                  ]}
                  onPress={() => {
                    setSelectedPayment(method.id);
                    setSelectedPaymentType(method.type);
                  }}
                >
                  <View style={styles.preferredPaymentLeft}>
                    <Text style={styles.preferredPaymentLabel}>{method.name}</Text>
                    <Text style={styles.preferredPaymentType}>{method.type === 'upi' ? 'UPI' : method.type === 'netbanking' ? 'Net Banking' : 'Card'}</Text>
                  </View>
                  {selectedPayment === method.id && (
                    <CheckCircle2 size={20} color="#38A169" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.paymentTypeSelector}>
            <TouchableOpacity 
              style={[
                styles.paymentTypeOption,
                selectedPaymentType === 'upi' && styles.selectedPaymentType
              ]}
              onPress={() => setSelectedPaymentType('upi')}
            >
              <Text style={styles.paymentTypeText}>UPI</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.paymentTypeOption,
                selectedPaymentType === 'netbanking' && styles.selectedPaymentType
              ]}
              onPress={() => setSelectedPaymentType('netbanking')}
            >
              <Text style={styles.paymentTypeText}>Net Banking</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.paymentTypeOption,
                selectedPaymentType === 'card' && styles.selectedPaymentType
              ]}
              onPress={() => setSelectedPaymentType('card')}
            >
              <Text style={styles.paymentTypeText}>Card</Text>
            </TouchableOpacity>
          </View>

          {selectedPaymentType === 'upi' && (
            <View style={styles.paymentTypeContent}>
              <Text style={styles.paymentTypeTitle}>Select UPI App</Text>
              <View style={styles.upiOptions}>
                {upiOptions.map((upi) => (
                  <TouchableOpacity 
                    key={upi.id}
                    style={[
                      styles.upiOption,
                      selectedPayment === upi.id && styles.selectedUpiOption
                    ]}
                    onPress={() => setSelectedPayment(upi.id)}
                  >
                    <View style={styles.upiLogo}>
                      <Text style={styles.upiLogoText}>{upi.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.upiText}>{upi.name}</Text>
                    {selectedPayment === upi.id && (
                      <CheckCircle2 size={16} color="#38A169" style={styles.upiCheckmark} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedPaymentType === 'netbanking' && (
            <View style={styles.paymentTypeContent}>
              <Text style={styles.paymentTypeTitle}>Select Bank</Text>
              <View style={styles.bankOptions}>
                {banks.map((bank, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.bankOption,
                      selectedPayment === bank.name.toLowerCase() && styles.selectedBankOption
                    ]}
                    onPress={() => setSelectedPayment(bank.name.toLowerCase())}
                  >
                    <View style={styles.bankLogo}>
                      <Image source={{ uri: bank.logo }} style={styles.bankLogoImage} resizeMode="contain" />
                    </View>
                    <Text style={styles.bankText}>{bank.name}</Text>
                    {selectedPayment === bank.name.toLowerCase() && (
                      <CheckCircle2 size={16} color="#38A169" style={styles.bankCheckmark} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedPaymentType === 'card' && (
            <View style={styles.paymentTypeContent}>
              <Text style={styles.paymentTypeTitle}>Enter Card Details</Text>
              <View style={styles.cardForm}>
                <View>
                  <TextInput
                    style={[styles.input, cardErrors.cardNumber ? styles.inputError : null]}
                    placeholder="Card Number"
                    keyboardType="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChangeText={(text: string) => {
                      const cleaned = text.replace(/\D/g, '');
                      setCardNumber(cleaned);
                      if (cleaned.length > 0) {
                        setSelectedPayment('card');
                      }
                    }}
                    onBlur={() => validateCardNumber(cardNumber)}
                  />
                  {cardErrors.cardNumber ? <Text style={styles.errorText}>{cardErrors.cardNumber}</Text> : null}
                </View>
                
                <View style={styles.cardRow}>
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={[styles.input, cardErrors.expiryDate ? styles.inputError : null]}
                      placeholder="Expiry (MM/YY)"
                      value={expiryDate}
                      maxLength={5}
                      keyboardType="numeric"
                      onChangeText={handleExpiryChange}
                      onBlur={() => validateExpiryDate(expiryDate)}
                    />
                    {cardErrors.expiryDate ? <Text style={styles.errorText}>{cardErrors.expiryDate}</Text> : null}
                  </View>
                  
                  <View style={styles.halfInputContainer}>
                    <TextInput
                      style={[styles.input, cardErrors.cvv ? styles.inputError : null]}
                      placeholder="CVV"
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={3}
                      value={cvv}
                      onChangeText={(text: string) => {
                        const cleaned = text.replace(/\D/g, '');
                        setCvv(cleaned);
                      }}
                      onBlur={() => validateCVV(cvv)}
                    />
                    {cardErrors.cvv ? <Text style={styles.errorText}>{cardErrors.cvv}</Text> : null}
                  </View>
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Name on Card"
                  value={nameOnCard}
                  onChangeText={setNameOnCard}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payButton, 
            (!selectedPayment && !useCoins) && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={(!selectedPayment && !useCoins) || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.payButtonText}>
              PAY {useCoins ? `WITH COINS (${requiredCoins} coins)` : `₹${amount}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>
          Payment successful! ₹{cashback} cashback applied.
        </Text>
      </Snackbar>
    </View>
  );
};

export default PaymentOptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C7A7B',
    paddingTop: 48,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    marginBottom: 70, 
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryContent: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4A5568',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValueGreen: {
    fontSize: 14,
    fontWeight: '500',
    color: '#38A169',
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  preferredPaymentsList: {
    gap: 8,
  },
  preferredPaymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  selectedPaymentItem: {
    borderColor: '#38A169',
    backgroundColor: '#F0FFF4',
  },
  preferredPaymentLeft: {
    flexDirection: 'column',
  },
  preferredPaymentLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  preferredPaymentType: {
    fontSize: 12,
    color: '#718096',
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  paymentTypeOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  selectedPaymentType: {
    backgroundColor: '#2C7A7B',
  },
  paymentTypeText: {
    fontWeight: '500',
    color: '#4A5568',
  },
  paymentTypeContent: {
    gap: 12,
  },
  paymentTypeTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  upiOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  upiOption: {
    width: '30%',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    position: 'relative',
  },
  selectedUpiOption: {
    borderColor: '#38A169',
    backgroundColor: '#F0FFF4',
  },
  upiLogo: {
    width: 48,
    height: 48,
    backgroundColor: '#2C7A7B',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  upiLogoText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  upiText: {
    fontSize: 12,
    textAlign: 'center',
  },
  upiCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  bankOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  bankOption: {
    width: '22%',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 12,
    position: 'relative',
  },
  selectedBankOption: {
    borderColor: '#38A169',
    backgroundColor: '#F0FFF4',
  },
  bankLogo: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  bankLogoImage: {
    width: 48,
    height: 48,
  },
  bankText: {
    fontSize: 12,
    textAlign: 'center',
  },
  bankCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  cardForm: {
    gap: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    marginTop: 4,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInputContainer: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  payButton: {
    backgroundColor: '#2C7A7B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  snackbar: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    margin: 16,
  },
  snackbarText: {
    color: '#fff',
    fontWeight: '500',
  },
  coinsPaymentOption: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
  coinsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  coinIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  coinsBalanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinsRequiredText: {
    fontSize: 14,
    color: '#666',
  },
  useCoinsButton: {
    backgroundColor: '#38A169',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  useCoinsButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  useCoinsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelCoinsButton: {
    borderWidth: 1,
    borderColor: '#E53E3E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelCoinsButtonText: {
    color: '#E53E3E',
  },
});