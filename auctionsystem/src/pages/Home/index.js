import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Divider, ImageList, ImageListItem } from "@mui/material";
import firebaseService from "~/services/firebase";
import Paper from '@mui/material/Paper';

function Home() {
  const navigate = useNavigate();
  const [itemData, setItemData] = useState([]);



  const calculateTimeLeft = (items) => {
    return items.map((item) => {
      const auctionEndTime = item.auctionEnd.toMillis(); // Convert timestamp to milliseconds
      const currentTime = Date.now(); // Get current time in milliseconds
      const timeStart = currentTime - item.auctionStart.toMillis();
      let timeDiff = Math.max(0, auctionEndTime - currentTime); // Ensure time difference is non-negative
      const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60)); // Calculate remaining hours
      timeDiff -= hoursLeft * (1000 * 60 * 60); // Subtract hours from time difference
      const minutesLeft = Math.floor(timeDiff / (1000 * 60)); // Calculate remaining minutes
      timeDiff -= minutesLeft * (1000 * 60); // Subtract minutes from time difference
      const secondsLeft = Math.floor(timeDiff / 1000); // Calculate remaining seconds
      return { ...item, timeLeft: { hours: hoursLeft, minutes: minutesLeft, seconds: secondsLeft },timeStartNow: timeStart };
    });
  };

  const handleItemClick = (itemId) => {
    if(localStorage.getItem("role") == 1) navigate(`/update/${itemId}`) 
    else navigate(`/detail/${itemId}`);
  };


  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      // Xử lý khi thời gian chạy ngược đạt 0
      // Ví dụ: Hiển thị thông báo hoặc thực hiện một hành động
      console.log('Countdown finished!');
    }
    const fetchItems = async () => {
      try {
        const items = await firebaseService.getItems();
        const itemsWithTimeLeft = calculateTimeLeft(items);
        setItemData(itemsWithTimeLeft);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [countdown]);

  return (
    <div style={{marginTop:"99px",marginBottom:"99px"}}>
        <ImageList cols={5}>
          {itemData.map((item) => (
            <Button key={item.id} onClick={() => handleItemClick(item.id)}>
              <Paper elevation={2} sx={{padding:"24px", width:"100%",height:"100%"}}>
                <ImageListItem sx={{fontSize:"14px"}}>
                  <div style={{height:"175px",alignContent:"center"}}><img src={item.imageUrl} alt={item.name} style={{maxWidth:"100%",maxHeight:"200px"}} /></div>
                  <div style={{height:"100%"}}>
                    <p style={{marginTop:"10px",marginBottom:"6px",fontWeight:"bold"}}>{item.name}</p>
                    <Divider />
                    <p>{item.currentPrice} $</p>
                    <Divider />
                    {(item.timeLeft.hours == 0 && item.timeLeft.minutes == 0 && item.timeLeft.seconds == 0)? 
                    <p style={{color:"#52b202", fontWeight:"bold", padding:"8px",borderRadius:"4px",width:"fit-content",height:"max-content",display:"flex",justifyContent:"center"}}>
                      {item.timeLeft.hours} giờ {item.timeLeft.minutes} phút {item.timeLeft.seconds} giây </p> 
                    :(item.timeStartNow >= 0)?
                    <p style={{color:"#ff9800", fontWeight:"bold",padding:"8px",borderRadius:"4px",width:"fit-content",height:"max-content",display:"flex",justifyContent:"center"}}>
                      {item.timeLeft.hours} giờ {item.timeLeft.minutes} phút {item.timeLeft.seconds} giây  </p> 
                    : <p style={{color:"#03a9f4", fontWeight:"bold",padding:"8px",borderRadius:"4px",width:"fit-content",height:"max-content",display:"flex",justifyContent:"center"}}>
                      {item.timeLeft.hours} giờ {item.timeLeft.minutes} phút {item.timeLeft.seconds} giây </p> 
                      }
                    <Divider />
                  </div>
                </ImageListItem>
              </Paper>
            </Button>
          ))}
        </ImageList>
    </div>
  );
}

export default Home;
