import { FaLockOpen , FaLock, FaBox, FaMapPin } from 'react-icons/fa';

const convert = <T,>(Icon: T) => Icon as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

export const StoreIcon = convert(FaLockOpen);
export const Unlock = convert(FaLock);
export const Box = convert(FaBox);
export const Pin = convert(FaMapPin);