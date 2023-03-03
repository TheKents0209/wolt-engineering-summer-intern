import { Box, Grid, InputAdornment, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

//Calculates distance fee multiplier to so every 500m adds 0.5€
export function calculateDistanceFee(distanceValue: number) {
  const distanceFeeMultiplier = Math.ceil(distanceValue / 500);
  if (distanceFeeMultiplier > 2) {
    return distanceFeeMultiplier;
  } else {
    return 2;
  }
}

//Calculates rush fee share of total fee
//Rounding is made so user won't get sums eg. 4.999999993€
export function calculateRushFeeShare(dFee: number) {
  return Math.round(Math.abs(dFee * 1.2 - dFee) * 100) / 100
}

export function calculateBulkItemFee(itemCount: number) {
  if (itemCount >= 5) {
    if (itemCount > 12) {
      return (itemCount - 4) * 0.5 + 1.2;
    } else {
      return (itemCount - 4) * 0.5;
    }
  } else {
    return 0;
  }
}

//If cart value is under 10€ add surplus as small order fee
export function calculateSmallOrderFee(orderValue: number) {
  if (orderValue < 10) {
    return Math.round(Math.abs(10 - orderValue) * 100) / 100;
  } else {
    return 0
  }
}

export function calculateTotalFee(cartValue: number, totalFees: number, isRush: boolean) {
  if(cartValue < 100) {
    if(isRush) {
      if(totalFees + calculateRushFeeShare(totalFees) >= 15) {
        return 15
      } else {
        return totalFees + calculateRushFeeShare(totalFees)
      }
    } else {
      if(totalFees > 15) {
        return 15
      } else {
        return totalFees
      }
    }
  } else {
    return 0
  }
}

export default function Main() {
  //Regex to validate inputs
  const cartValueRegex = new RegExp("^[0-9]+(.[0-9]{1,2})?$");
  const onlyNumbersRegex = new RegExp("^[0-9]*$");

  const [cartValue, setCartValue] = useState("");
  const [distanceValue, setDistanceValue] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [dateTimeValue, setDateTimeValue] = useState<Dayjs | null>(dayjs());
  const [deliveryPrice, setDeliveryPrice] = useState("");

  const [smallOrderFee, setSmallOrderFee] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [bulkItemFee, setBulkItemFee] = useState("");
  const [rushFee, setRushFee] = useState("");
  const [isRush, setIsRush] = useState<Boolean>(false);

  useEffect(() => {
    calculateDeliveryPrice();
    isFridayRush();
  });

  //Extend UTC to check friday rush between 3-7PM UTC
  dayjs.extend(utc);

  function isFridayRush() {
    if (
      dateTimeValue?.utc().day() === 5 &&
      dateTimeValue?.utc().hour() >= 15 &&
      dateTimeValue?.utc().hour() <= 19
    ) {
      setIsRush(true);
    } else {
      setIsRush(false);
    }
  }

  function calculateDeliveryPrice() {
    //If all inputs filled correctly
    if (
      cartValueRegex.test(cartValue) &&
      onlyNumbersRegex.test(distanceValue) &&
      onlyNumbersRegex.test(itemAmount) &&
      Number(cartValue) > 0 &&
      Number(distanceValue) > 0 &&
      Number(itemAmount) > 0
    ) {
    
      setSmallOrderFee(calculateSmallOrderFee(Number(cartValue)).toString())
      setDeliveryFee(calculateDistanceFee(Number(distanceValue)).toString())
      setBulkItemFee(calculateBulkItemFee(Number(itemAmount)).toString());

      const totalFees = Number(deliveryFee) + Number(bulkItemFee) + Number(smallOrderFee)

      
      if(isRush) {
        //Show user rush fee share of delivery price
        setRushFee(calculateRushFeeShare(totalFees).toString())
        setDeliveryPrice(calculateTotalFee(Number(cartValue), totalFees, true).toString())
      } else {
        setDeliveryPrice(calculateTotalFee(Number(cartValue),totalFees, false).toString())
      }

      //Clear UI values if some inputs are missing
    } else {
      setSmallOrderFee("- ");
      setDeliveryFee("- ");
      setBulkItemFee("- ");
      setRushFee("- ");
      setDeliveryPrice("- ");
    }
  }

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      sx={{ mt: 2 }}
    >
      <Box display={"flex"} alignItems={"center"} sx={{ mb: 2 }}>
        <Typography sx={{ margin: 2, maxWidth: "80px" }}>Cart Value</Typography>
        <TextField
          error={cartValue !== "" && !cartValueRegex.test(cartValue)}
          helperText={
            cartValue !== "" && !cartValueRegex.test(cartValue)
              ? "Incorrect entry"
              : ""
          }
          variant="outlined"
          value={cartValue}
          onChange={(e) => {
            setCartValue(e.target.value);
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end">€</InputAdornment>,
          }}
          sx={{ alignSelf: "flex-end" }}
        />
      </Box>
      <Box display={"flex"} alignItems={"center"} sx={{ mb: 2 }}>
        <Typography sx={{ margin: 2, maxWidth: "80px" }}>
          Delivery distance
        </Typography>
        <TextField
          error={distanceValue !== "" && !onlyNumbersRegex.test(distanceValue)}
          helperText={
            distanceValue !== "" && !onlyNumbersRegex.test(distanceValue)
              ? "Only numbers allowed"
              : ""
          }
          variant="outlined"
          value={distanceValue}
          onChange={(e) => {
            setDistanceValue(e.target.value);
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
        />
      </Box>
      <Box display={"flex"} alignItems={"center"} sx={{ mb: 2 }}>
        <Typography sx={{ margin: 2, maxWidth: "80px" }}>
          Amount of items
        </Typography>
        <TextField
          error={itemAmount !== "" && !onlyNumbersRegex.test(itemAmount)}
          helperText={
            itemAmount !== "" && !onlyNumbersRegex.test(itemAmount)
              ? "Only numbers allowed"
              : ""
          }
          variant="outlined"
          value={itemAmount}
          onChange={(e) => {
            setItemAmount(e.target.value);
          }}
        />
      </Box>
      <Box display={"flex"} alignItems={"center"} sx={{ mb: 2 }}>
        <Typography sx={{ margin: 2, maxWidth: "80px" }}>Time</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            renderInput={(props) => <TextField {...props} />}
            value={dateTimeValue}
            onChange={(newValue) => {
              setDateTimeValue(newValue);
            }}
          />
        </LocalizationProvider>
      </Box>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        flexDirection={"column"}
        sx={{ mb: 2, mt: 2 }}
      >
        <Typography sx={{ fontWeight: "bold" }}>Delivery price:</Typography>
        <Typography>{deliveryPrice}€</Typography>
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Typography sx={{ fontWeight: "bold" }}>
            <br></br>Delivery price consists of:
          </Typography>
          <Typography>Small order surcharge: {smallOrderFee}€</Typography>
          <Typography>Delivery fee: {deliveryFee}€</Typography>
          <Typography>Bulk item fee: {bulkItemFee}€</Typography>
          <Typography>{isRush ? "Rush fee: " + rushFee + "€" : ""}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
