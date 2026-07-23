import { createContext, type RefObject } from "react";
import * as Three from 'three'

interface ScrollTargetContextParams {
    pageContainerRef: RefObject<HTMLDivElement | null>
    geoGroupRef: RefObject<Three.Group | null>
}
export const ScrollTargetContext = createContext<ScrollTargetContextParams | null>(null)