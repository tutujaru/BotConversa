import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  InputBase,
  IconButton,
  Paper,
} from "@material-ui/core";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Cancel as CancelIcon,
  GetApp,
  Mic as MicIcon,
  HighlightOff as HighlightOffIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@material-ui/icons";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";
import ModalImageCors from "../../components/ModalImageCors";
import toastError from "../../errors/toastError";
import MicRecorder from "mic-recorder-to-mp3";
import RecordingTimer from "../../components/MessageInputCustom/RecordingTimer";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#f9f9f9",
    borderLeft: "1px solid #ccc",
  },
  messagesWrapper: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(2),
    backgroundImage: "url('/whatsapp-bg.png')",
    backgroundSize: "cover",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    borderRadius: theme.spacing(2),
    wordBreak: "break-word",
    boxShadow: theme.shadows[1],
  },
  sent: {
    marginLeft: "auto",
    backgroundColor: "#dcf8c6",
    borderBottomRightRadius: 0,
  },
  received: {
    marginRight: "auto",
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 0,
  },
  inputArea: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    borderTop: "1px solid #ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginRight: theme.spacing(1),
    padding: theme.spacing(1, 2),
    backgroundColor: "#f1f1f1",
    borderRadius: theme.spacing(2),
  },
  fileInput: {
    display: "none",
  },
  mediaPreview: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1),
    backgroundColor: "#eee",
  },
}));

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const [contentMessage, setContentMessage] = useState("");
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom;
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = (e) => {
    if (!pageInfo.hasMore || loading) return;
    if (e.currentTarget.scrollTop < 600) handleLoadMore();
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) return;
    setMedias(Array.from(e.target.files));
  };

  const checkMessageMedia = (msg) => {
    switch (msg.mediaType) {
      case "image": return <ModalImageCors imageUrl={msg.mediaPath} />;
      case "audio": return <audio controls src={msg.mediaPath} />;
      case "video": return <video width="250" controls src={msg.mediaPath} />;
      default:
        return (
          <IconButton href={msg.mediaPath} download target="_blank">
            <GetApp />
          </IconButton>
        );
    }
  };

  const handleSendMedia = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      medias.forEach((m) => {
        formData.append("medias", m);
        formData.append("body", m.name);
      });
      formData.append("fromMe", true);
      await api.post(`/chats/${chat.id}/messages`, formData);
      setMedias([]);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) throw new Error("Áudio muito curto");
      const filename = `audio-${Date.now()}.mp3`;
      const formData = new FormData();
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);
      await api.post(`/chats/${chat.id}/messages`, formData);
    } catch (err) {
      toastError(err);
    }
    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop();
    } catch {}
    setRecording(false);
  };

  return (
    <Paper className={classes.container} elevation={1}>
      <div onScroll={handleScroll} className={classes.messagesWrapper}>
        {messages.map((msg, i) => (
          <Box
            key={i}
            className={
              msg.senderId === user.id
                ? `${classes.messageBubble} ${classes.sent}`
                : `${classes.messageBubble} ${classes.received}`
            }
          >
            <Typography variant="body2" color="textSecondary">{msg.sender.name}</Typography>
            {msg.mediaPath && checkMessageMedia(msg)}
            <Typography variant="body1">{msg.message}</Typography>
            <Typography variant="caption" color="textSecondary">{datetimeToClient(msg.createdAt)}</Typography>
          </Box>
        ))}
        <div ref={baseRef} />
      </div>

      <div className={classes.inputArea}>
        {recording ? (
          <>
            <IconButton onClick={handleCancelAudio}><HighlightOffIcon /></IconButton>
            <RecordingTimer />
            <IconButton onClick={handleUploadAudio}><CheckCircleOutlineIcon /></IconButton>
          </>
        ) : medias.length > 0 ? (
          <div className={classes.mediaPreview}>
            <IconButton onClick={() => setMedias([])}><CancelIcon /></IconButton>
            <Typography>{medias[0]?.name}</Typography>
            <IconButton onClick={handleSendMedia}><SendIcon /></IconButton>
          </div>
        ) : (
          <>
            <FileInput handleChangeMedias={handleChangeMedias} disableOption={loading} />
            <InputBase
              className={classes.input}
              placeholder="Digite sua mensagem"
              value={contentMessage}
              onChange={(e) => setContentMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && contentMessage.trim()) {
                  handleSendMessage(contentMessage);
                  setContentMessage("");
                }
              }}
            />
            {contentMessage ? (
              <IconButton onClick={() => {
                handleSendMessage(contentMessage);
                setContentMessage("");
              }}><SendIcon /></IconButton>
            ) : (
              <IconButton onClick={handleStartRecording}><MicIcon /></IconButton>
            )}
          </>
        )}
      </div>
    </Paper>
  );
}

const FileInput = ({ handleChangeMedias, disableOption }) => {
  const classes = useStyles();
  return (
    <>
      <input
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption}
        className={classes.fileInput}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <IconButton component="span" disabled={disableOption}>
          <AttachFileIcon />
        </IconButton>
      </label>
    </>
  );
};
