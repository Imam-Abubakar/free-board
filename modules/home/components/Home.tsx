import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";

import NotFoundModal from "../modals/NotFound";

const Home = () => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);

  useEffect(() => {
    socket.on("created", (roomIdFromServer) => {
      setAtomRoomId(roomIdFromServer);
      router.push(roomIdFromServer);
    });

    const handleJoinedRoom = (roomIdFromServer: string, failed?: boolean) => {
      if (!failed) {
        setAtomRoomId(roomIdFromServer);
        router.push(roomIdFromServer);
      } else {
        openModal(<NotFoundModal id={roomId} />);
      }
    };

    socket.on("joined", handleJoinedRoom);

    return () => {
      socket.off("created");
      socket.off("joined", handleJoinedRoom);
    };
  }, [openModal, roomId, router, setAtomRoomId]);

  useEffect(() => {
    socket.emit("leave_room");
    setAtomRoomId("");
  }, [setAtomRoomId]);

  const handleCreateRoom = () => {
    socket.emit("create_room", username);
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (roomId) socket.emit("join_room", roomId, username);
  };

  return (
    <div className="flex flex-col items-center px-4 py-24">
      <h1 className="text-5xl font-extrabold leading-tight sm:text-extra">
        Free Board
      </h1>
      <h3 className="mx-auto text-center text-xl sm:text-2xl">
        Your Personal Collaborative, Real-time Whiteboard
      </h3>

      <div className="mt-10 flex flex-col gap-2">
        <label className="self-start font-bold leading-tight">
          Enter your name
        </label>
        <input
          className="input"
          id="room-id"
          placeholder="Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value.slice(0, 15))}
        />
      </div>

      <div className="gap-30 bg mt-10 flex flex-col items-center justify-between rounded-[10px] border-[1px] border-zinc-400 p-8 align-middle">
        <form
          className="flex flex-col items-center gap-3"
          onSubmit={handleJoinRoom}
        >
          <label
            htmlFor="room-id"
            className="self-start font-bold text-center  mx-auto leading-tight"
          >
            Enter room id
          </label>
          <input
            className="input"
            id="room-id"
            placeholder="Room id..."
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button className="btn" type="submit">
            Join
          </button>
        </form>
        <div className="my-8 flex w-80 items-center gap-2">
          <div className="h-px w-full bg-zinc-400" />
          <p className="text-zinc-400">or</p>
          <div className="h-px w-full bg-zinc-400" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h5 className="self-start font-bold leading-tight">
            Create new room
          </h5>

          <button className="btn" onClick={handleCreateRoom}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
