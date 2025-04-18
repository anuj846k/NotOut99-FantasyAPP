import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { saveUserData } from '@/app/store/UserSlice';
import { useAppDispatch, useAppSelector } from '@/app/store/index';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { userData, status } = useAppSelector((state) => state.user);
  
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    });
    
    const [initialFormData, setInitialFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    });
    
    const [isFormChanged, setIsFormChanged] = useState(false);
  
    useEffect(() => {
      if (userData) {
        const userFormData = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          avatar: userData.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
        };
        
        setFormData(userFormData);
        setInitialFormData(userFormData);
      }
    }, [userData]);
    
    useEffect(() => {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData);
      setIsFormChanged(hasChanged);
    }, [formData, initialFormData]);
  
    const handleSave = () => {
      if (!isFormChanged) return;
      
      dispatch(saveUserData({
        ...userData,
        ...formData,
        dateRegistered: userData?.dateRegistered || new Date().toISOString(),
      }));
      
      setInitialFormData(formData);
      setIsFormChanged(false);
      router.back();
    };
    
    const handleImagePicker = async () => {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to grant access to your photo library to change your avatar.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        setFormData({
          ...formData,
          avatar: result.assets[0].uri,
        });
      }
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PROFILE PAGE</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.doneButton, !isFormChanged && styles.disabledButton]}
            disabled={!isFormChanged}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: formData.avatar }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editProfileButton} onPress={handleImagePicker}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
          />
        </View>
  
        {status === 'loading' && (
          <View style={styles.loadingOverlay}>
            <Text>Saving...</Text>
          </View>
        )}
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 16,
    backgroundColor: '#e85d04',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  doneButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  editProfileButton: {
    marginTop: 12,
  },
  editProfileText: {
    fontSize: 16,
    color: '#2C7A7B',
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 16,
    gap: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditProfileScreen;