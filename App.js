import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Button,
  StatusBar,
  Image,
  TouchableOpacity
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'

class App extends React.Component {
  state = {
    predictions: null,
    predictionComplete: false,
    buttonPressed: false,
    imageStringObject: {"baseString": null}
  }

  async componentDidMount() {
    this.getPermissionAsync()
  }

  // permissions for ios (compulsory)
  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!')
      }
    }
  }

  // select image 
  // retrieve the base64 string
  // which is found in response.uri in format: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD…"
  // and store it to the imageStringObject state
  // in the form of an object with key baseString
  selectImage = async () => {
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        base64: true
      })
      console.log('image selected is: ')
      console.log(response)

      if (!response.cancelled) {
        // puts base64 string in an object with baseString as key
        const stringObject = { "baseString": response.uri }
        console.log('object body is: ')
        console.log(stringObject)
        
        // object with uri Key and base64 Value is set to image state
        this.setState({ imageStringObject: stringObject })
      }
    } catch (error) {
      console.log(error)
    }
  }

  // will use this to render json response
  forgeryDetection = async () => {
    // object whose Value is the base64 string and key is baseString
    let data = this.state.imageStringObject
    this.setState({predictionComplete: false, buttonPressed: true})
    console.log('data to be sent is: ')
    console.log(data)

    return await fetch('http://192.168.29.32:5000/', {
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
     },
      // convert object to JSON string
      body: JSON.stringify(data)
    })
    .then((response) => {
      console.log('about to print response')
      console.log(response)      
      return response.json()
    })
    .then(response => {
      console.log('setting predictions to state')
      this.setState({predictions: response.result, predictionComplete: true}) //check it correct it
      console.log('state set')
    })
    .catch(function(error) {
      console.log('There has been a problem with your fetch operation: ' + error.message);
      // ADD THIS THROW error
        throw error;
      })
  }

  render() {
    const image = this.state.imageStringObject.baseString
    const prediction = this.state.predictions
    const predictionComplete = this.state.predictionComplete
    const buttonPressed = this.state.buttonPressed

    return (
      <View style={styles.container}>

        {/* TITLE */}
        <StatusBar barStyle='light-content' />
        <View style={styles.loadingContainer}>
          <Text style={styles.titleText}>Forgery Detection</Text>
        </View>

        {/* IMAGE SELECTION */}
        <TouchableOpacity
          style={styles.imageWrapper}
          onPress={this.selectImage}>
          {image && <Image source={{uri: image}} style={styles.imageContainer} />}

          {!image && (
            <Text style={styles.transparentText}>Tap to choose image</Text>
          )}
        </TouchableOpacity>

        {/* SEND TO SERVER */}
        <Button
          onPress={this.forgeryDetection}
          title="Verify"
          color="#841584"
        />

          {buttonPressed ? (predictionComplete ? <Text style={styles.predictionText}>{prediction}</Text> : <Text style={styles.predictionText}>Please wait predicting...</Text>) : <Text></Text>}
          

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  loadingContainer: {
    marginTop: 80,
    justifyContent: 'center'
  },
  loaderContainer: {
    marginTop: 50,
    marginBottom: 25,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 40,
    fontWeight: "bold"
  },
  text: {
    color: '#000',
    fontSize: 16
  },
  predictionText: {
    fontSize: 25,
    marginTop: 55
  },
  textReject: {
    color: 'red',
    fontSize: 16
  },
  textAccept: {
    color: 'lime',
    fontSize: 16
  },
  imageWrapper: {
    width: 280,
    height: 280,
    padding: 10,
    borderColor: '#cf667f',
    borderWidth: 5,
    borderStyle: 'solid',
    marginTop: 40,
    marginBottom: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    width: 250,
    height: 250,
    position: 'absolute',
    top: 10,
    left: 10,
    bottom: 10,
    right: 10
  },
  transparentText: {
    color: '#1e1e1e',
    opacity: 0.7
  }  
})

export default App
