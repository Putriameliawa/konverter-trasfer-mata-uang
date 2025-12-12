import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['@mediapipe/hands', '@mediapipe/face_detection', '@mediapipe/camera_utils']
	},
	build: {
		minify: 'terser',
		target: 'es2015',
		reportCompressedSize: false,
		chunkSizeWarningLimit: 1000
	}
});