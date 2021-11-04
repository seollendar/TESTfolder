
/*bearing*/
public static double getDirection(double previousLatitude, double previousLongitude, double currentLatitude, double currentLongitude){
    double previousLatitude_radian =   (previousLatitude * Math.PI / 180)
    double currentLatitude_radian = (currentLatitude * Math.PI / 180)
    double longitude_diff_radian = ((currentLongitude-previousLongitude) * Math.PI / 180)

    double y = Math.sin((currentLongitude-previousLongitude) * Math.PI / 180) * Math.cos(currentLatitude * Math.PI / 180);
    double x = Math.cos(previousLatitude * Math.PI / 180) * Math.sin(currentLatitude * Math.PI / 180) - Math.sin(previousLatitude * Math.PI / 180) * Math.cos(currentLatitude * Math.PI / 180) * Math.cos((currentLongitude-previousLongitude) * Math.PI / 180);
    return (((Math.atan2(y,x)) * 180 / Math.PI) + 360) % 360; 
}    

/* 수식화 */
(
    (
        (Math.atan2(
            Math.sin((currentLongitude-previousLongitude) * Math.PI / 180) * Math.cos(currentLatitude * Math.PI / 180), Math.cos(previousLatitude * Math.PI / 180) * Math.sin(currentLatitude * Math.PI / 180) - Math.sin(previousLatitude * Math.PI / 180) * Math.cos(currentLatitude * Math.PI / 180) * Math.cos((currentLongitude-previousLongitude) * Math.PI / 180)
            )        
        ) * 180/ Math.PI
    )+ 360
) % 360

/* EXCEL */
=IF(OR(OR(L4=" null",M4=" null"),N4=" null"),"null",MOD(
        (
            ATAN2(
                COS(previousLatitude*PI()/180)*SIN(currentLatitude*PI()/180)-SIN(previousLatitude*PI()/180)*COS(currentLatitude*PI()/180)*COS((currentLongitude-previousLongitude)*PI()/180),
                SIN((currentLongitude-previousLongitude)*PI()/180)*COS(currentLatitude*PI()/180)
            )*180/PI()
        )+360
,360))


/*decimal degree -> radian*/
public static double convertdecimaldegreestoradians(double degree){
    return (degree * Math.PI / 180);
}

/*decimal radian -> degree*/
public static double convertradianstodecimaldegrees(double radian){
    return (radian * 180 / Math.PI);
}      



