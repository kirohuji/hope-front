import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function ChatVoiceRecorder({ disabled, onClose, onSend }) {
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingSecondsRef = useRef(0);

  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const stopRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const clearPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
    setAudioFile(null);
    setIsPlaying(false);
    setAudioDuration(0);
    setRecordedSeconds(0);
  }, [audioUrl]);

  const formatRecordingTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds % 60;
    return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
  }, []);

  const getSupportedAudioMimeType = useCallback(() => {
    if (!window.MediaRecorder?.isTypeSupported) {
      return '';
    }

    return (
      [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav',
      ].find((mimeType) => window.MediaRecorder.isTypeSupported(mimeType)) || ''
    );
  }, []);

  const getAudioExtension = useCallback((mimeType = '') => {
    if (mimeType.includes('mp4')) return 'm4a';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('wav')) return 'wav';
    return 'webm';
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    stopRecordingTimer();
    stopMediaStream();
    setIsRecording(false);
    setRecordingSeconds(0);
    recordingSecondsRef.current = 0;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, [stopMediaStream, stopRecordingTimer]);

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        enqueueSnackbar('当前浏览器不支持录音');
        return;
      }

      clearPreview();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordingSecondsRef.current = 0;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioMimeType = recorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: audioMimeType });
        const extension = getAudioExtension(audioMimeType);
        const recordedFile = new File([audioBlob], `voice-${Date.now()}.${extension}`, {
          type: audioMimeType,
        });

        stopRecordingTimer();
        stopMediaStream();
        setIsRecording(false);
        setRecordedSeconds(recordingSecondsRef.current);
        setRecordingSeconds(0);
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];

        if (audioBlob.size > 0) {
          setAudioFile(recordedFile);
          setAudioUrl(URL.createObjectURL(audioBlob));
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      stopRecordingTimer();
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((seconds) => {
          const nextSeconds = seconds + 1;
          recordingSecondsRef.current = nextSeconds;
          return nextSeconds;
        });
      }, 1000);
    } catch (e) {
      stopRecordingTimer();
      stopMediaStream();
      setIsRecording(false);
      enqueueSnackbar(e?.message || '无法打开麦克风');
    }
  }, [
    clearPreview,
    enqueueSnackbar,
    getAudioExtension,
    getSupportedAudioMimeType,
    stopMediaStream,
    stopRecordingTimer,
  ]);

  const handleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const handleRetry = useCallback(() => {
    clearPreview();
    startRecording();
  }, [clearPreview, startRecording]);

  const handleSend = useCallback(async () => {
    if (!audioFile) {
      return;
    }

    try {
      setIsSending(true);
      const sent = await onSend(audioFile);
      if (sent !== false) {
        clearPreview();
      }
    } finally {
      setIsSending(false);
    }
  }, [audioFile, clearPreview, onSend]);

  const handlePlayPreview = useCallback(async () => {
    if (!audioRef.current) {
      return;
    }

    if (audioRef.current.paused) {
      await audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const handleLoadedMetadata = useCallback((event) => {
    const { duration } = event.currentTarget;
    if (Number.isFinite(duration)) {
      setAudioDuration(duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, []);

  const handleDelete = useCallback(() => {
    clearPreview();
  }, [clearPreview]);

  const handleClose = useCallback(() => {
    if (isRecording) {
      cancelRecording();
    }
    clearPreview();
    onClose?.();
  }, [cancelRecording, clearPreview, isRecording, onClose]);

  useEffect(
    () => () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.stop();
      }
      stopRecordingTimer();
      stopMediaStream();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    },
    [audioUrl, stopMediaStream, stopRecordingTimer]
  );

  const renderWaveform = (active = false) => (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.35}>
      {[10, 18, 12, 24, 15, 28, 14, 22, 11, 18, 13].map((height, index) => (
        <Box
          key={`${height}-${index}`}
          sx={{
            width: 3,
            height,
            borderRadius: 1,
            bgcolor: active ? 'error.main' : 'text.disabled',
            opacity: active ? 0.95 : 0.45,
            ...(active && {
              animation: 'voicePulse 900ms ease-in-out infinite',
              animationDelay: `${index * 70}ms`,
            }),
          }}
        />
      ))}
    </Stack>
  );

  const previewDuration = audioDuration || recordedSeconds;

  if (audioUrl) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          px: 1,
          py: 0.75,
          width: 1,
          minHeight: 48,
          borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
          '@keyframes voicePulse': {
            '0%, 100%': { transform: 'scaleY(0.45)' },
            '50%': { transform: 'scaleY(1)' },
          },
        }}
      >
        <Box
          component="audio"
          ref={audioRef}
          preload="metadata"
          src={audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          sx={{ display: 'none' }}
        />
        <Box
          component="button"
          type="button"
          onClick={handlePlayPreview}
          disabled={disabled || isSending}
          sx={{
            minWidth: 0,
            flexGrow: 1,
            height: 36,
            px: 1,
            border: 0,
            borderRadius: 1,
            cursor: disabled || isSending ? 'default' : 'pointer',
            color: 'text.secondary',
            bgcolor: 'background.neutral',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Iconify icon={isPlaying ? 'solar:pause-bold' : 'solar:play-bold'} width={18} />
          {renderWaveform(isPlaying)}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatRecordingTime(Math.floor(previewDuration))}
          </Typography>
        </Box>
        <Tooltip title="删除">
          <span>
            <IconButton onClick={handleDelete} disabled={disabled || isSending} size="small">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="重录">
          <span>
            <IconButton onClick={handleRetry} disabled={disabled || isSending} size="small">
              <Iconify icon="solar:refresh-bold" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="发送录音">
          <span>
            <IconButton onClick={handleSend} disabled={disabled || isSending} color="primary">
              <Iconify icon={isSending ? 'svg-spinners:8-dots-rotate' : 'solar:plain-bold'} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="返回输入">
          <span>
            <IconButton onClick={handleClose} disabled={isSending} size="small">
              <Iconify icon="solar:keyboard-bold" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        px: 1,
        py: 0.75,
        width: 1,
        minHeight: 48,
        borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
        '@keyframes voicePulse': {
          '0%, 100%': { transform: 'scaleY(0.45)' },
          '50%': { transform: 'scaleY(1)' },
        },
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={handleRecord}
        disabled={disabled || isSending}
        sx={{
          minWidth: 0,
          flexGrow: 1,
          height: 36,
          px: 1,
          border: 0,
          borderRadius: 1,
          cursor: disabled || isSending ? 'default' : 'pointer',
          color: isRecording ? 'error.main' : 'text.secondary',
          bgcolor: isRecording ? 'error.lighter' : 'background.neutral',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {renderWaveform(isRecording)}
        <Typography variant="body2" sx={{ color: 'inherit' }}>
          {isRecording ? `录音中 ${formatRecordingTime(recordingSeconds)}` : '点击录音'}
        </Typography>
      </Box>
      <Tooltip title="返回输入">
        <span>
          <IconButton onClick={handleClose} disabled={disabled && !isRecording} size="small">
            <Iconify icon="solar:keyboard-bold" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

ChatVoiceRecorder.propTypes = {
  disabled: PropTypes.bool,
  onClose: PropTypes.func,
  onSend: PropTypes.func,
};
