// Hand detection utilities using MediaPipe

export interface HandDetectionResult {
  detected: boolean;
  confidence: number;
  landmarks?: any[];
}

export class HandDetector {
  private camera: any = null;
  private hands: any = null;
  private initialized = false;
  private stream: MediaStream | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import to handle MediaPipe
      const mediapipeModule = await import('@mediapipe/hands');
      const { Hands } = mediapipeModule;
      
      this.hands = new Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
      });

      this.initialized = true;
    } catch (error) {
      // Silent error handling for production
      throw new Error('Hand detection not available');
    }
  }

  async startDetection(
    videoElement: HTMLVideoElement,
    onResults: (result: HandDetectionResult) => void
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.hands.onResults((results: any) => {
      const detected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
      const confidence = detected ? 0.8 : 0; // Simplified confidence
      
      onResults({
        detected,
        confidence,
        landmarks: results.multiHandLandmarks
      });
    });

    // Use getUserMedia directly instead of MediaPipe Camera
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoElement.srcObject = this.stream;
      
      // Process video frames
      const processFrame = async () => {
        if (this.hands && videoElement.videoWidth > 0) {
          await this.hands.send({ image: videoElement });
        }
        if (this.stream) {
          requestAnimationFrame(processFrame);
        }
      };
      
      videoElement.onloadedmetadata = () => {
        processFrame();
      };
      
    } catch (error) {
      // Silent error handling for production
      throw new Error('Camera access denied');
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.camera = null;
  }
}

// Fallback simple hand detection for when MediaPipe is not available
export class FallbackHandDetector {
  private stream: MediaStream | null = null;

  async startDetection(
    videoElement: HTMLVideoElement,
    onResults: (result: HandDetectionResult) => void
  ): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoElement.srcObject = this.stream;
      
      // Simulate hand detection with simple gesture (click/tap on video)
      videoElement.addEventListener('click', () => {
        onResults({
          detected: true,
          confidence: 0.9
        });
        
        // Reset after 2 seconds
        setTimeout(() => {
          onResults({
            detected: false,
            confidence: 0
          });
        }, 2000);
      });

    } catch (error) {
      // Silent error handling for production
      throw new Error('Camera access denied');
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}