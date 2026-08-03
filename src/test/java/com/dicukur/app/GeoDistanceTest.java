package com.dicukur.app;

import com.dicukur.app.common.location.GeoDistance;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GeoDistanceTest {

    @Test
    void sameCoordinateHasZeroDistance() {
        assertEquals(0, GeoDistance.haversine(-6.2, 106.8, -6.2, 106.8), 0.0001);
    }

    @Test
    void jakartaToBandungIsApproximatelyWithinExpectedDistance() {
        double distance = GeoDistance.haversine(-6.2088, 106.8456, -6.9175, 107.6191);
        assertEquals(118, distance, 5);
    }
}
