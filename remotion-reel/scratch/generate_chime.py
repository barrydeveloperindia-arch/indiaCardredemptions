import math
import struct
import wave

def generate_chime_wav(filename, duration=3.0, sample_rate=44100):
    # Frequencies for a clean, premium A Major chord (A4, C#5, E5, A5)
    frequencies = [440.0, 554.37, 659.25, 880.0]
    
    num_samples = int(duration * sample_rate)
    
    # Open wave file
    with wave.open(filename, 'wb') as wav_file:
        # Mono, 2 bytes per sample (16-bit), 44100 Hz
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        frames = []
        for i in range(num_samples):
            t = i / sample_rate
            
            # Combine sine waves
            val = 0.0
            for f in frequencies:
                val += math.sin(2.0 * math.pi * f * t)
            val /= len(frequencies)
            
            # Apply envelope: quick attack (0.05s) and slow exponential decay
            if t < 0.05:
                envelope = t / 0.05
            else:
                envelope = math.exp(-1.5 * (t - 0.05))
                
            sample = val * envelope
            
            # Convert float to 16-bit signed integer
            int_sample = int(sample * 32767.0 * 0.8) # 80% volume limit
            
            # Bound check
            int_sample = max(-32768, min(32767, int_sample))
            
            # Pack as 16-bit little endian signed short
            frames.append(struct.pack('<h', int_sample))
            
        wav_file.writeframes(b''.join(frames))
    print(f"Generated synthetic chime chord at {filename}")

if __name__ == "__main__":
    generate_chime_wav("public/outro_chime.wav", duration=4.0)
