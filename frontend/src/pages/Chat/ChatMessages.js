import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import CancelIcon from "@material-ui/icons/Cancel";
import CircularProgress from "@material-ui/core/CircularProgress";
import ModalImageCors from "../../components/ModalImageCors";
import GetAppIcon from "@material-ui/icons/GetApp";
import toastError from "../../errors/toastError";
import MicRecorder from "mic-recorder-to-mp3";
import MicIcon from "@material-ui/icons/Mic";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import RecordingTimer from "../../components/MessageInputCustom/RecordingTimer";

// Contexts & Services
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { useDate } from "../../hooks/useDate";
import moment from "moment";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    height: "100%",
    padding: "10px",
    backgroundColor: "#F0F2F5",
    ...theme.scrollbarStyles,
  },
  inputArea: {
    position: "relative",
    height: "auto",
    borderTop: "1px solid #ddd",
    backgroundColor: "#F0F2F5",
  },
  input: {
    padding: "10px 20px",
    borderRadius: 25,
    border: "1px solid #ccc",
    backgroundColor: "#F5F5F5",
    fontSize: 14,
    minHeight: 40,
    "&:focus": {
      borderColor: "#00A884",
      outline: "none",
    },
  },
  dateTag: {
    textAlign: "center",
    margin: theme.spacing(1, 0),
  },
  dateText: {
    background: "#ECEFF1",
    padding: "4px 12px",
    borderRadius: 12,
    fontSize: 12,
    color: "#666",
  },
  sendMessageIcons: {
    color: "#666",
  },
  uploadInput: {
    display: "none",
  },
  circleLoading: {
    color: "#00A884",
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },
  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },
  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  messageMedia: {
    width: "100%",
    maxWidth: 250,
    maxHeight: 250,
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid #ccc",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "10px 20px",
  },
  cancelAudioIcon: {
    color: "red",
  },
  audioLoading: {
    color: "#00A884",
    opacity: "70%",
  },
  sendAudioIcon: {
    color: "#00A884",
  },
  messageBox: {
    padding: "10px 15px",
    margin: "8px 20px",
    maxWidth: "70%",
    borderRadius: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    wordBreak: "break-word",
    position: "relative",
    display: "inline-block",
  },
  messageLeft: {
    backgroundColor: "#ECEFF1",
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
    marginLeft: "10px",
  },
  messageRight: {
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
    marginRight: "10px",
  },
  typingStatus: {
    fontStyle: "italic",
    fontSize: 12,
    color: "#999",
    marginLeft: 10,
    marginTop: 4,
  },
}));

// Componente de mensagem otimizado
const MessageItem = React.memo(
  ({ item, isSender, previousMessage, classes, datetimeToClient }) => {
    const isSameSender =
      previousMessage && item.senderId === previousMessage.senderId;
    const isSameDay =
      previousMessage &&
      moment(item.createdAt).isSame(previousMessage.createdAt, "day");

    return (
      <React.Fragment key={item.id || `msg-${item.senderId}`}>
        {!previousMessage || !isSameDay ? (
          <Box className={classes.dateTag}>
            <Typography className={classes.dateText}>
              {moment(item.createdAt).calendar(null, {
                sameDay: "[Hoje]",
                lastDay: "[Ontem]",
                lastWeek: "DD/MM/YYYY",
                sameElse: "DD/MM/YYYY",
              })}
            </Typography>
          </Box>
        ) : null}

        <Box
          className={`${classes.messageBox} ${
            isSender ? classes.messageRight : classes.messageLeft
          }`}
        >
          {!isSender && !isSameSender && (
            <Typography variant="subtitle2" color="textPrimary">
              {item.sender?.name || "Remetente"}
            </Typography>
          )}
          {item.mediaPath && <MessageMedia message={item} classes={classes} />}
          <Typography variant="body2">{item.message}</Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            display="block"
            align={isSender ? "right" : "left"}
          >
            {datetimeToClient(item.createdAt).split(" ")[1]}
            {isSender && " • "}
            {isSender && item.seenAt && "✔✔"}
          </Typography>
        </Box>
      </React.Fragment>
    );
  }
);

// Componente para exibição de mídia
const MessageMedia = ({ message, classes }) => {
  switch (message.mediaType) {
    case "image":
      return <ModalImageCors imageUrl={message.mediaPath} />;
    case "audio":
      return (
        <audio controls style={{ width: "100%", marginTop: 8 }}>
          <source src={message.mediaPath} type="audio/mp3" />
        </audio>
      );
    case "video":
      return (
        <video className={classes.messageMedia} src={message.mediaPath} controls />
      );
    default:
      return (
        <div className={classes.downloadMedia}>
          <Button
            startIcon={<GetAppIcon />}
            color="primary"
            variant="outlined"
            target="_blank"
            href={message.mediaPath}
          >
            Baixar
          </Button>
        </div>
      );
  }
};

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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom;
  }, [scrollToBottomRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recording) Mp3Recorder.stop();
      if (typingTimeoutRef.current)
        clearTimeout(typingTimeoutRef.current);
    };
  }, [recording]);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) handleLoadMore();
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) return;
    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleSendMedia = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });
    try {
      await api.post(`/chats/${chat.id}/messages`, formData);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
    setMedias([]);
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
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `audio-${new Date().getTime()}.mp3`;
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
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && contentMessage.trim()) {
      handleSendMessage(contentMessage);
      setContentMessage("");
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    setTypingUser(user);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingUser(null);
    }, 3000); // Mostra por 3 segundos
  };

  return (
    <Paper className={classes.mainContainer}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, index) => (
            <MessageItem
              key={item.id || `msg-${index}`}
              item={item}
              isSender={item.senderId === user.id}
              previousMessage={index > 0 ? messages[index - 1] : null}
              classes={classes}
              datetimeToClient={datetimeToClient}
            />
          ))}

        {/* Status digitando */}
        {isTyping && typingUser && (
          <Box className={`${classes.messageBox} ${classes.messageLeft}`}>
            <Typography variant="subtitle2">{typingUser.name}</Typography>
            <Typography variant="body2" className={classes.typingStatus}>
              Digitando...
            </Typography>
          </Box>
        )}

        <div ref={baseRef}></div>
      </div>

      <div className={classes.inputArea}>
        <FormControl variant="outlined" fullWidth>
          {recording ? (
            <div className={classes.recorderWrapper}>
              <IconButton onClick={handleCancelAudio}>
                <HighlightOffIcon className={classes.cancelAudioIcon} />
              </IconButton>
              {loading ? (
                <CircularProgress className={classes.audioLoading} size={24} />
              ) : (
                <RecordingTimer />
              )}
              <IconButton onClick={handleUploadAudio} disabled={loading}>
                <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
              </IconButton>
            </div>
          ) : (
            <>
              {medias.length > 0 ? (
                <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
                  <IconButton onClick={() => setMedias([])}>
                    <CancelIcon className={classes.sendMessageIcons} />
                  </IconButton>
                  {loading ? (
                    <CircularProgress className={classes.circleLoading} size={24} />
                  ) : (
                    <span>{medias[0]?.name}</span>
                  )}
                  <IconButton onClick={handleSendMedia} disabled={loading}>
                    <SendIcon className={classes.sendMessageIcons} />
                  </IconButton>
                </Paper>
              ) : (
                <Input
                  multiline
                  value={contentMessage}
                  onChange={(e) => {
                    setContentMessage(e.target.value);
                    handleTyping(); // Ativa o status de "digitando"
                  }}
                  onKeyDown={handleKeyDown}
                  className={classes.input}
                  startAdornment={
                    <InputAdornment position="start">
                      <FileInput disableOption={loading} handleChangeMedias={handleChangeMedias} />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      {contentMessage ? (
                        <IconButton
                          onClick={() => {
                            if (contentMessage.trim()) {
                              handleSendMessage(contentMessage);
                              setContentMessage("");
                            }
                          }}
                        >
                          <SendIcon style={{ color: "#00A884" }} />
                        </IconButton>
                      ) : (
                        <IconButton onClick={handleStartRecording}>
                          <MicIcon className={classes.sendMessageIcons} />
                        </IconButton>
                      )}
                    </InputAdornment>
                  }
                />
              )}
            </>
          )}
        </FormControl>
      </div>
    </Paper>
  );
}

// Componente para upload de arquivos
const FileInput = ({ handleChangeMedias, disableOption }) => {
  const classes = useStyles();

  return (
    <>
      <input
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption}
        className={classes.uploadInput}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <IconButton component="span" disabled={disableOption}>
          <AttachFileIcon className={classes.sendMessageIcons} />
        </IconButton>
      </label>
    </>
  );
};
