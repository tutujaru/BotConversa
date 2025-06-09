import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  IconButton,
  useTheme,
  AppBar,
  Toolbar,
  Avatar,
  Typography
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as InsertEmoticonIcon,
  Mic as MicIcon,
} from "@material-ui/icons";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { has, isObject } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import { i18n } from "../../translate/i18n";
import Title from "../../components/Title";

// Cores do WhatsApp
const whatsAppColors = {
  green: "#128C7E",
  lightGreen: "#25D366",
  chatGreen: "#DCF8C6",
  chatGray: "#ECE5DD",
  headerGreen: "#128C7E",
  headerDark: "#00a884",
  backgroundLight: "#FFFFFF",
  backgroundDark: "#FFFFFF",
  textPrimary: "#FFFFFF",
  textSecondary: "#8696A0",
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    backgroundColor: theme.palette.mode === "light" 
      ? whatsAppColors.backgroundLight 
      : whatsAppColors.backgroundDark,
    backgroundImage: theme.palette.mode === "light"
      ? "url('https://web.whatsapp.com/img/bg-chat-tile-light_686b98c9fdffb3f631cf59efdf6728a8.png')"
      : "url('https://web.whatsapp.com/img/bg-chat-tile-dark_0a9ed5a6e4f7a3d0b0f8.png')",
    backgroundBlendMode: "soft-light",
    display: "flex",
    flexDirection: "column",
  },
  container: {
    flex: 1,
    display: "flex",
    height: "calc(100% - 64px)",
    width: "100%",
    maxWidth: 1600,
    margin: "0 auto",
    boxShadow: theme.shadows[6],
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.mode === "light" 
      ? "#ffffff" 
      : whatsAppColors.backgroundDark,
  },
  sidebar: {
    width: "30%",
    minWidth: 300,
    maxWidth: 400,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.mode === "light" 
      ? "#ffffff" 
      : whatsAppColors.headerDark,
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.mode === "light" 
      ? whatsAppColors.backgroundLight 
      : whatsAppColors.backgroundDark,
    position: "relative",
    backgroundImage: theme.palette.mode === "light"
      ? "url('https://web.whatsapp.com/img/bg-chat-tile-light_686b98c9fdffb3f631cf59efdf6728a8.png')"
      : "url('https://web.whatsapp.com/img/bg-chat-tile-dark_0a9ed5a6e4f7a3d0b0f8.png')",
    backgroundBlendMode: "soft-light",
  },
  header: {
    backgroundColor: theme.palette.mode === "light" 
      ? whatsAppColors.headerGreen 
      : whatsAppColors.headerDark,
    color: "#ffffff",
    padding: theme.spacing(1, 2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
    boxShadow: theme.shadows[1],
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  headerActions: {
    display: "flex",
    gap: theme.spacing(1),
    color: "#ffffff",
  },
  searchContainer: {
    backgroundColor: theme.palette.mode === "light" 
      ? "#FFFFFF" 
      : whatsAppColors.headerDark,
    padding: theme.spacing(1, 2),
  },
  searchInput: {
    backgroundColor: theme.palette.mode === "light" 
      ? "#FFFFFF" 
      : "#FFFFFF",
    borderRadius: 18,
    padding: theme.spacing(0.5, 2),
    "& input": {
      padding: theme.spacing(1),
      fontSize: "0.9rem",
    },
  },
  chatListContainer: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: theme.palette.mode === "light" 
      ? "#ffffff" 
      : whatsAppColors.headerDark,
  },
  messageContainer: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  messageInputContainer: {
    backgroundColor: theme.palette.mode === "light" 
      ? "#f0f2f5" 
      : "#202c33",
    padding: theme.spacing(1, 2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  messageInput: {
    flex: 1,
    backgroundColor: theme.palette.mode === "light" 
      ? "#ffffff" 
      : "#2a3942",
    borderRadius: 20,
    padding: theme.spacing(1, 2),
    "& .MuiInputBase-root": {
      padding: 0,
    },
    "& .MuiInputBase-input": {
      padding: theme.spacing(0.5),
    },
  },
  inputActions: {
    display: "flex",
    gap: theme.spacing(1),
    color: theme.palette.mode === "light" 
      ? whatsAppColors.textSecondary 
      : "#8696a0",
  },
  sendButton: {
    backgroundColor: whatsAppColors.lightGreen,
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#00b248",
    },
  },
  dialogPaper: {
    borderRadius: 4,
  },
  tabContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.mode === "light" 
      ? "#ffffff" 
      : whatsAppColors.headerDark,
  },
  mobileHeader: {
    backgroundColor: theme.palette.mode === "light" 
      ? whatsAppColors.headerGreen 
      : whatsAppColors.headerDark,
    color: "#ffffff",
    padding: theme.spacing(1, 2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    zIndex: 1,
    boxShadow: theme.shadows[1],
  },
}));

export function ChatModal({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
  user,
}) {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle("");
    setUsers([]);
    if (type === "edit" && chat?.users) {
      const userList = chat.users.map((u) => ({
        id: u.user.id,
        name: u.user.name,
      }));
      setUsers(userList);
      setTitle(chat.title);
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      if (!title) {
        alert("Por favor, preencha o título da conversa.");
        return;
      }

      if (!users || users.length === 0) {
        alert("Por favor, selecione pelo menos um usuário.");
        return;
      }

      if (type === "edit") {
        await api.put(`/chats/${chat.id}`, {
          users,
          title,
        });
      } else {
        const { data } = await api.post("/chats", {
          users,
          title,
        });
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (err) {}
  };  

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        style: { borderRadius: 4 },
        className: theme.classes?.dialogPaper,
      }}
    >
      <DialogTitle id="alert-dialog-title" style={{ fontWeight: 600, backgroundColor: theme.palette.mode === "light" ? whatsAppColors.headerGreen : whatsAppColors.headerDark, color: "#ffffff" }}>
        {type === "edit" ? "Editar conversa" : "Nova conversa"}
      </DialogTitle>
      <DialogContent style={{ backgroundColor: theme.palette.mode === "light" ? "#ffffff" : whatsAppColors.backgroundDark }}>
        <Grid spacing={2} container>
          <Grid xs={12} style={{ padding: theme.spacing(2) }} item>
            <TextField
              label="Título"
              placeholder="Nome da conversa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid xs={12} item>
            <UsersFilter
              onFiltered={(users) => setUsers(users)}
              initialUsers={users}
              excludeId={user.id}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions style={{ padding: theme.spacing(2), backgroundColor: theme.palette.mode === "light" ? "#f0f2f5" : "#202c33" }}>
        <Button 
          onClick={handleClose} 
          variant="text"
          style={{ color: theme.palette.mode === "light" ? whatsAppColors.textSecondary : "#8696a0" }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          style={{ backgroundColor: whatsAppColors.lightGreen, color: "#ffffff" }}
        >
          {type === "edit" ? "Atualizar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const { id } = useParams();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      findChats().then((data) => {
        const { records } = data;
        if (records.length > 0) {
          setChats(records);
          setChatsPageInfo(data);

          if (id && records.length) {
            const chat = records.find((r) => r.uuid === id);
            selectChat(chat);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const onChatUser = (data) => {
      if (data.action === "create") {
        setChats((prev) => [data.record, ...prev]);
      }
      if (data.action === "update") {
        const changedChats = chats.map((chat) => {
          if (chat.id === data.record.id) {
            setCurrentChat(data.record);
            return {
              ...data.record,
            };
          }
          return chat;
        });
        setChats(changedChats);
      }
    }

    const onChat = (data) => {
      if (data.action === "delete") {
        const filteredChats = chats.filter((c) => c.id !== +data.id);
        setChats(filteredChats);
        setMessages([]);
        setMessagesPage(1);
        setMessagesPageInfo({ hasMore: false });
        setCurrentChat({});
        history.push("/chats");
      }
    }

    const onCurrentChat = (data) => {
        if (data.action === "new-message") {
          setMessages((prev) => [...prev, data.newMessage]);
          const changedChats = chats.map((chat) => {
            if (chat.id === data.newMessage.chatId) {
              return {
                ...data.chat,
              };
            }
            return chat;
          });
          setChats(changedChats);
          scrollToBottomRef.current();
        }

        if (data.action === "update") {
          const changedChats = chats.map((chat) => {
            if (chat.id === data.chat.id) {
              return {
                ...data.chat,
              };
            }
            return chat;
          });
          setChats(changedChats);
          scrollToBottomRef.current();
        }
      }

    socket.on(`company-${companyId}-chat-user-${user.id}`, onChatUser); 
    socket.on(`company-${companyId}-chat`, onChat);
    if (isObject(currentChat) && has(currentChat, "id")) {
      socket.on(`company-${companyId}-chat-${currentChat.id}`, onCurrentChat);
    }
        
    return () => {
      socket.disconnect();
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat, socketManager]);

  const selectChat = (chat) => {
    try {
      setMessages([]);
      setMessagesPage(1);
      setCurrentChat(chat);
      setTab(1);
    } catch (err) {}
  };

  const sendMessage = async (contentMessage) => {
    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage,
      });
    } catch (err) {}
    setLoading(false);
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (err) {}
  };

  const findMessages = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/chats/${chatId}/messages?pageNumber=${messagesPage}`
      );
      setMessagesPage((prev) => prev + 1);
      setMessagesPageInfo(data);
      setMessages((prev) => [...data.records, ...prev]);
    } catch (err) {}
    setLoading(false);
  };

  const loadMoreMessages = async () => {
    if (!loading) {
      findMessages(currentChat.id);
    }
  };

  const findChats = async () => {
    try {
      const { data } = await api.get("/chats");
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const renderDesktopLayout = () => {
    return (
      <div className={classes.container}>
        {/* Sidebar - Lista de conversas */}
        <div className={classes.sidebar}>
          <div className={classes.header}>
            <Avatar src={user.profileUrl} />
            <div className={classes.headerActions}>
              <IconButton size="small" style={{ color: "#ffffff" }}>
                <AddIcon onClick={() => setShowDialog(true)} />
              </IconButton>
              <IconButton size="small" style={{ color: "#ffffff" }}>
                <MoreVertIcon />
              </IconButton>
            </div>
          </div>
          
          <div className={classes.searchContainer}>
            <TextField
              placeholder="Pesquisar ou começar uma nova conversa"
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" style={{ color: whatsAppColors.textSecondary }} />,
                className: classes.searchInput,
              }}
            />
          </div>
          
          <div className={classes.chatListContainer}>
            <ChatList
              chats={chats}
              pageInfo={chatsPageInfo}
              loading={loading}
              handleSelectChat={(chat) => selectChat(chat)}
              handleDeleteChat={(chat) => deleteChat(chat)}
              handleEditChat={() => {
                setDialogType("edit");
                setShowDialog(true);
              }}
              whatsAppStyle
            />
          </div>
        </div>

        {/* Área principal de conversa */}
        <div className={classes.chatContainer}>
          {isObject(currentChat) && has(currentChat, "id") ? (
            <>
              <div className={classes.header}>
                <div className={classes.headerContent}>
                  <Avatar src={currentChat.profileUrl || ""} />
                  <div>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {currentChat.title}
                    </Typography>
                    <Typography variant="caption">
                      {currentChat.isOnline ? "Online" : "Offline"}
                    </Typography>
                  </div>
                </div>
                <div className={classes.headerActions}>
                  <IconButton size="small" style={{ color: "#ffffff" }}>
                    <SearchIcon />
                  </IconButton>
                  <IconButton size="small" style={{ color: "#ffffff" }}>
                    <MoreVertIcon />
                  </IconButton>
                </div>
              </div>

              <div className={classes.messageContainer}>
                <ChatMessages
                  chat={currentChat}
                  scrollToBottomRef={scrollToBottomRef}
                  pageInfo={messagesPageInfo}
                  messages={messages}
                  loading={loading}
                  handleSendMessage={sendMessage}
                  handleLoadMore={loadMoreMessages}
                  whatsAppStyle
                />
              </div>

              
            </>
          ) : (
            <div style={{ 
              flex: 1, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              flexDirection: "column",
              color: theme.palette.mode === "light" ? whatsAppColors.textPrimary : "#d1d7db"
            }}>
              <Typography variant="h5" style={{ fontWeight: 300, marginBottom: 16 }}>
                WhatsApp Web
              </Typography>
              <Typography variant="body2" style={{ textAlign: "center", maxWidth: 500 }}>
                Selecione uma conversa para começar a enviar mensagens.
              </Typography>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMobileLayout = () => {
    return (
      <div className={classes.tabContainer}>
        {tab === 0 && (
          <>
            <div className={classes.mobileHeader}>
              <Typography variant="h6" style={{ flex: 1, fontWeight: 500 }}>
                Conversas
              </Typography>
              <IconButton 
                size="small" 
                style={{ color: "#ffffff" }}
                onClick={() => setShowDialog(true)}
              >
                <AddIcon />
              </IconButton>
            </div>
            
            <div className={classes.searchContainer}>
              <TextField
                placeholder="Pesquisar"
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" style={{ color: whatsAppColors.textSecondary }} />,
                  className: classes.searchInput,
                }}
              />
            </div>
            
            <div className={classes.chatListContainer}>
              <ChatList
                chats={chats}
                pageInfo={chatsPageInfo}
                loading={loading}
                handleSelectChat={(chat) => selectChat(chat)}
                handleDeleteChat={(chat) => deleteChat(chat)}
                whatsAppStyle
              />
            </div>
          </>
        )}
        
        {tab === 1 && (
          <>
            <div className={classes.mobileHeader}>
              <IconButton 
                size="small" 
                style={{ color: "#ffffff" }}
                onClick={() => setTab(0)}
              >
                <ArrowBackIcon />
              </IconButton>
              <Avatar src={currentChat.profileUrl || ""} style={{ width: 32, height: 32 }} />
              <Typography variant="subtitle1" style={{ flex: 1, fontWeight: 500 }}>
                {currentChat.title}
              </Typography>
              <IconButton size="small" style={{ color: "#ffffff" }}>
                <SearchIcon />
              </IconButton>
              <IconButton size="small" style={{ color: "#ffffff" }}>
                <MoreVertIcon />
              </IconButton>
            </div>
            
            <div className={classes.messageContainer}>
              <ChatMessages
                chat={currentChat}
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
                whatsAppStyle
              />
            </div>
            
            <div className={classes.messageInputContainer}>
              <IconButton size="small">
                <InsertEmoticonIcon />
              </IconButton>
              <IconButton size="small">
                <AttachFileIcon />
              </IconButton>
              <TextField
                placeholder="Digite uma mensagem"
                variant="outlined"
                size="small"
                fullWidth
                className={classes.messageInput}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
              <IconButton className={classes.sendButton} size="small">
                <MicIcon />
              </IconButton>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        handleLoadNewChat={(data) => {
          setMessages([]);
          setMessagesPage(1);
          setCurrentChat(data);
          if (!isWidthUp("md", props.width)) setTab(1);
          history.push(`/chats/${data.uuid}`);
        }}
        handleClose={() => setShowDialog(false)}
        user={user}
      />
      
      {isWidthUp("md", props.width) ? renderDesktopLayout() : renderMobileLayout()}
    </div>
  );
}

export default withWidth()(Chat);
