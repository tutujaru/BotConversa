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
  useTheme,
} from "@material-ui/core";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";

import { has, isObject } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import whatsBackground from "../../assets/wa-background.png";
import whatsBackgroundDark from "../../assets/wa-background-dark.png";

import { i18n } from "../../translate/i18n";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: theme.shadows[5],
    background: theme.palette.background.default,
    position: "relative",
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        theme.palette.type === "light"
          ? `linear-gradient(rgba(255,255,255,0.95), rgba(245,245,245,0.97)), url(${whatsBackground})`
          : `linear-gradient(rgba(18,18,18,0.95), rgba(30,30,30,0.98)), url(${whatsBackgroundDark})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      zIndex: 0,
    },
  },
  contentWrapper: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background:
      theme.palette.type === "light"
        ? "linear-gradient(45deg, #f5f7fa 0%, #e4e8f0 100%)"
        : "linear-gradient(45deg, #1a1a2e 0%, #16213e 100%)",
  },
  gridContainer: {
    flex: 1,
    minHeight: 0,
    borderRadius: 12,
    overflow: "hidden",
    margin: theme.spacing(1),
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    transition: "all 0.3s ease",
  },
  chatListWrapper: {
    height: "100%",
    background: theme.palette.background.paper,
    borderRadius: 12,
    boxShadow: theme.shadows[2],
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  newChatButton: {
    margin: theme.spacing(2),
    alignSelf: "flex-end",
    background:
      theme.palette.type === "light"
        ? "linear-gradient(45deg, #2196F3 0%, #21CBF3 100%)"
        : "linear-gradient(45deg, #BB86FC 0%, #3700B3 100%)",
    color: "white",
    fontWeight: 600,
    borderRadius: 24,
    padding: "8px 24px",
    "&:hover": {
      boxShadow: theme.shadows[4],
      transform: "translateY(-2px)",
    },
  },
  tabs: {
    background: theme.palette.background.paper,
    "& .MuiTabs-indicator": {
      height: 4,
      borderRadius: "2px 2px 0 0",
      background:
        theme.palette.type === "light"
          ? "linear-gradient(45deg, #2196F3 0%, #21CBF3 100%)"
          : "linear-gradient(45deg, #BB86FC 0%, #3700B3 100%)",
    },
    "& .MuiTab-root": {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "1rem",
      minWidth: 120,
    },
    "& .Mui-selected": {
      color: theme.palette.type === "light" ? "#2196F3" : "#BB86FC",
    },
  },
  dialogPaper: {
    borderRadius: 16,
    background: theme.palette.background.paper,
    backgroundImage:
      theme.palette.type === "light"
        ? "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)"
        : "linear-gradient(to right, #232526 0%, #414345 100%)",
  },
  dialogTitle: {
    background:
      theme.palette.type === "light"
        ? "linear-gradient(45deg, #f5f7fa 0%, #e4e8f0 100%)"
        : "linear-gradient(45deg, #1a1a2e 0%, #16213e 100%)",
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 700,
  },
  dialogButton: {
    borderRadius: 12,
    fontWeight: 600,
    padding: "8px 20px",
    margin: theme.spacing(1),
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.03)",
    },
  },
  primaryButton: {
    background:
      theme.palette.type === "light"
        ? "linear-gradient(45deg, #2196F3 0%, #21CBF3 100%)"
        : "linear-gradient(45deg, #BB86FC 0%, #3700B3 100%)",
    color: "white",
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
  const classes = useStyles();
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
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle className={classes.dialogTitle}>Conversa</DialogTitle>
      <DialogContent>
        <Grid spacing={2} container>
          <Grid xs={12} style={{ padding: 18 }} item>
            <TextField
              label="Título"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                style: {
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.8)",
                },
              }}
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
      <DialogActions>
        <Button
          onClick={handleClose}
          color="primary"
          className={`${classes.dialogButton}`}
        >
          Fechar
        </Button>
        <Button
          onClick={handleSave}
          className={`${classes.dialogButton} ${classes.primaryButton}`}
          variant="contained"
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const classes = useStyles();
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
    };

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
    };

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
    };

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

  const renderGrid = () => {
    return (
      <div className={classes.contentWrapper}>
        <div className={classes.header}>
          <Title>{i18n.t("internalChat.title")}</Title>
        </div>
        <Grid className={classes.gridContainer} container spacing={2}>
          <Grid className={classes.gridItem} md={4} lg={3} item>
            <div className={classes.chatListWrapper}>
              <Button
                className={classes.newChatButton}
                onClick={() => {
                  setDialogType("new");
                  setShowDialog(true);
                }}
              >
                Nova Conversa
              </Button>
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
              />
            </div>
          </Grid>
          <Grid className={classes.gridItem} md={8} lg={9} item>
            {isObject(currentChat) && has(currentChat, "id") && (
              <div className={classes.chatListWrapper}>
                <ChatMessages
                  chat={currentChat}
                  scrollToBottomRef={scrollToBottomRef}
                  pageInfo={messagesPageInfo}
                  messages={messages}
                  loading={loading}
                  handleSendMessage={sendMessage}
                  handleLoadMore={loadMoreMessages}
                />
              </div>
            )}
          </Grid>
        </Grid>
      </div>
    );
  };

  const renderTab = () => {
    return (
      <div className={classes.contentWrapper}>
        <Tabs
          value={tab}
          className={classes.tabs}
          onChange={(e, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Chats" />
          <Tab label="Mensagens" />
        </Tabs>

        {tab === 0 && (
          <div className={classes.chatListWrapper}>
            <Button
              className={classes.newChatButton}
              onClick={() => {
                setDialogType("new");
                setShowDialog(true);
              }}
            >
              Nova Conversa
            </Button>
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
            />
          </div>
        )}

        {tab === 1 && (
          <div className={classes.chatListWrapper}>
            {isObject(currentChat) && has(currentChat, "id") ? (
              <ChatMessages
                chat={currentChat}
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "textSecondary",
                }}
              >
                Selecione uma conversa para começar a enviar mensagens
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        handleLoadNewChat={(data) => {
          setMessages([]);
          setMessagesPage(1);
          setCurrentChat(data);
          setTab(1);
          history.push(`/chats/${data.uuid}`);
        }}
        handleClose={() => setShowDialog(false)}
        user={user}
      />
      <Paper className={classes.mainContainer}>
        {isWidthUp("md", props.width) ? renderGrid() : renderTab()}
      </Paper>
    </>
  );
}

export default withWidth()(Chat);
