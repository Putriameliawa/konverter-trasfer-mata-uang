import { FaceDetection } from '@mediapipe/face_detection';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface BiometricData {
  face: {
    detected: boolean;
    confidence: number;
    landmarks: any[];
    timestamp: Date;
  };
  hands: {
    detected: boolean;
    confidence: number;
    landmarks: any[];
    handedness: string;
    timestamp: Date;
  };
}

export interface VerificationResult {
  success: boolean;
  faceVerified: boolean;
  handVerified: boolean;
  confidence: number;
  timestamp: Date;
  message: string;
}

class BiometricVerificationService {
  private faceDetection: FaceDetection | null = null;
  private hands: Hands | null = null;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  
  private faceResults: any = null;
  private handResults: any = null;
  
  private callbacks: {
    onFaceDetected?: (results: any) => void;
    onHandDetected?: (results: any) => void;
    onVerificationComplete?: (result: VerificationResult) => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    this.initializeDetectors();
  }

  private initializeDetectors() {
    try {
      // Initialize Face Detection
      this.faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      this.faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      });

      this.faceDetection.onResults((results) => {
        this.handleFaceResults(results);
      });

      // Initialize Hand Detection
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults((results) => {
        this.handleHandResults(results);
      });

    } catch (error) {
      console.error('Error initializing biometric detectors:', error);
      this.callbacks.onError?.('Failed to initialize biometric detection: ' + error.message);
    }
  }

  public async initializeCamera(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<boolean> {
    try {
      this.videoElement = videoElement;
      this.canvasElement = canvasElement;
      this.canvasCtx = canvasElement.getContext('2d');

      if (!this.canvasCtx) {
        throw new Error('Could not get canvas context');
      }

      // Check if we have access to media devices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support camera access');
      }

      // Request camera permission first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Assign stream to video element
      videoElement.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => resolve(null);
      });

      // Start camera processing
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.faceDetection && this.hands) {
            await this.faceDetection.send({ image: videoElement });
            await this.hands.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });

      await this.camera.start();
      return true;
    } catch (error) {
      console.error('Error initializing camera:', error);
      this.callbacks.onError?.('Failed to access camera. Please ensure camera permissions are granted: ' + error.message);
      return false;
    }
  }

  private handleFaceResults(results: any) {
    this.faceResults = results;
    
    if (this.canvasCtx && this.canvasElement) {
      // Clear canvas
      this.canvasCtx.save();
      this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      
      // Draw video frame
      if (this.videoElement) {
        this.canvasCtx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
      }

      // Draw face detection results
      if (results.detections && results.detections.length > 0) {
        for (const detection of results.detections) {
          this.drawFaceDetection(detection);
        }
        
        this.callbacks.onFaceDetected?.(results);
      }
      
      this.canvasCtx.restore();
    }

    // Check if both face and hand are detected for verification
    this.checkVerificationCompletion();
  }

  private handleHandResults(results: any) {
    this.handResults = results;
    
    if (this.canvasCtx && this.canvasElement) {
      // Draw hand landmarks if detected
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          const handedness = results.multiHandedness[i];
          
          this.drawHandLandmarks(landmarks, handedness);
        }
        
        this.callbacks.onHandDetected?.(results);
      }
    }

    // Check if both face and hand are detected for verification
    this.checkVerificationCompletion();
  }

  private drawFaceDetection(detection: any) {
    if (!this.canvasCtx || !this.canvasElement) return;

    const { locationData } = detection;
    const { relativeBoundingBox } = locationData;
    
    const x = relativeBoundingBox.xCenter * this.canvasElement.width - (relativeBoundingBox.width * this.canvasElement.width) / 2;
    const y = relativeBoundingBox.yCenter * this.canvasElement.height - (relativeBoundingBox.height * this.canvasElement.height) / 2;
    const width = relativeBoundingBox.width * this.canvasElement.width;
    const height = relativeBoundingBox.height * this.canvasElement.height;

    // Draw face bounding box
    this.canvasCtx.strokeStyle = '#00ff00';
    this.canvasCtx.lineWidth = 3;
    this.canvasCtx.strokeRect(x, y, width, height);
    
    // Draw confidence score
    this.canvasCtx.fillStyle = '#00ff00';
    this.canvasCtx.font = '16px Arial';
    this.canvasCtx.fillText(
      `Face: ${(detection.score[0] * 100).toFixed(1)}%`,
      x,
      y - 10
    );
  }

  private drawHandLandmarks(landmarks: any[], handedness: any) {
    if (!this.canvasCtx || !this.canvasElement) return;

    // Draw hand landmarks
    this.canvasCtx.fillStyle = '#ff0000';
    this.canvasCtx.strokeStyle = '#00ff00';
    this.canvasCtx.lineWidth = 2;

    for (const landmark of landmarks) {
      const x = landmark.x * this.canvasElement.width;
      const y = landmark.y * this.canvasElement.height;
      
      this.canvasCtx.beginPath();
      this.canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
      this.canvasCtx.fill();
    }

    // Draw hand label
    if (landmarks.length > 0) {
      const wrist = landmarks[0];
      const x = wrist.x * this.canvasElement.width;
      const y = wrist.y * this.canvasElement.height;
      
      this.canvasCtx.fillStyle = '#ff0000';
      this.canvasCtx.font = '16px Arial';
      this.canvasCtx.fillText(
        `${handedness.label} Hand`,
        x,
        y - 20
      );
    }
  }

  private checkVerificationCompletion() {
    const faceDetected = this.faceResults?.detections && this.faceResults.detections.length > 0;
    const handDetected = this.handResults?.multiHandLandmarks && this.handResults.multiHandLandmarks.length > 0;

    if (faceDetected && handDetected) {
      const faceConfidence = this.faceResults.detections[0]?.score[0] || 0;
      const overallConfidence = faceConfidence;

      const result: VerificationResult = {
        success: true,
        faceVerified: true,
        handVerified: true,
        confidence: overallConfidence,
        timestamp: new Date(),
        message: 'Biometric verification successful'
      };

      this.callbacks.onVerificationComplete?.(result);
    }
  }

  public setCallbacks(callbacks: Partial<typeof this.callbacks>) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public async captureVerification(): Promise<BiometricData | null> {
    try {
      const faceDetected = this.faceResults?.detections && this.faceResults.detections.length > 0;
      const handDetected = this.handResults?.multiHandLandmarks && this.handResults.multiHandLandmarks.length > 0;

      if (!faceDetected || !handDetected) {
        throw new Error('Both face and hand must be visible for verification');
      }

      const biometricData: BiometricData = {
        face: {
          detected: faceDetected,
          confidence: this.faceResults.detections[0]?.score[0] || 0,
          landmarks: this.faceResults.detections[0]?.landmarks || [],
          timestamp: new Date()
        },
        hands: {
          detected: handDetected,
          confidence: 1.0, // Hand detection doesn't provide direct confidence
          landmarks: this.handResults.multiHandLandmarks[0] || [],
          handedness: this.handResults.multiHandedness?.[0]?.label || 'Unknown',
          timestamp: new Date()
        }
      };

      return biometricData;
    } catch (error) {
      console.error('Error capturing verification:', error);
      this.callbacks.onError?.('Failed to capture verification: ' + error.message);
      return null;
    }
  }

  public stopCamera() {
    if (this.camera) {
      this.camera.stop();
    }
    // Stop all video streams
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  }

  public cleanup() {
    this.stopCamera();
    this.faceDetection?.close();
    this.hands?.close();
  }
}

export default BiometricVerificationService;