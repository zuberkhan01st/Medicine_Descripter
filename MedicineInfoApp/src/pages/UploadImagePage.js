import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Configuration for API base URL
const API_URL = 'http://192.168.172.245:5001/api';

const UploadImagePage = () => {
  const [image, setImage] = useState(null);
  const [medicineName, setMedicineName] = useState('Orlistat Capsules USP');
  const [medicineDescription, setMedicineDescription] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to capture images.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri, width, height } = result.assets[0];

      if (width < 100 || height < 100) {
        Alert.alert(
          'Image too small',
          'Please capture an image with higher resolution (minimum 100x100 pixels).'
        );
        return;
      }

      setImage(uri);
      const scaleFactor = screenWidth / width;
      setImageDimensions({
        width: screenWidth - 40,
        height: height * scaleFactor,
      });

      handleExtractText(uri);
    }
  };

  const handleExtractText = async (imageUri) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'captured_image.jpg',
      });

      const response = await fetch(`${API_URL}/process-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const geminiText = data.geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'No description available';
        //const name = data.medicineName || 'Unknown Medicine';
        //setMedicineName(name);
        setMedicineDescription(geminiText);
      } else {
        console.error('Error extracting text:', data.error);
        Alert.alert('Error', 'Failed to extract text. Please try again.');
      }
    } catch (error) {
      console.error('Error sending request:', error.message || error);
      Alert.alert(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {line.slice(2, -2)}
          </Text>
        );
      } else if (line.startsWith('*') && !line.startsWith('**')) {
        return (
          <Text key={index} style={styles.bulletText}>
            {'\u2022'} {line.slice(1)}
          </Text>
        );
      } else if (line.startsWith('    *')) {
        return (
          <Text key={index} style={styles.subBulletText}>
            {'\u2022'} {line.slice(5)}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={styles.text}>
            {line}
          </Text>
        );
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medicine Details Extractor</Text>

      {/* Image section */}
      {image && (
        <View style={styles.imageContainer}>
          <Text style={styles.sectionTitle}>Captured Image</Text>
          <Image
            source={{ uri: image }}
            style={[styles.image, { width: imageDimensions.width, height: imageDimensions.height }]}
          />
        </View>
      )}

      {/* Camera button */}
      <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
        <Text style={styles.cameraButtonText}>Open Camera</Text>
      </TouchableOpacity>

      {/* Loading indicator */}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />}

      {/* Extracted details */}
      {!loading && medicineDescription && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description:</Text>
          <ScrollView style={styles.textContainer}>
            {renderFormattedText(medicineDescription)}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    color: '#555',
  },
  image: {
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  cameraButton: {
    backgroundColor: '#4299e1',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 10,
  },
  descriptionContainer: {
    marginTop: 20,
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  textContainer: {
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 24,
  },
  bulletText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginLeft: 10,
  },
  subBulletText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginLeft: 20,
  },
});

export default UploadImagePage;
