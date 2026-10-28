import React from 'react';

import ProcessHeader from '../../../components/ProcessHeader';
import { colors } from '../../../theme';

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
};

const QaAssyHeader: React.FC<Props> = ({ iconBgColor, ...props }) => (
  <ProcessHeader
    {...props}
    backgroundColor={colors.indigo}
    iconBackgroundColor={iconBgColor}
  />
);

export default QaAssyHeader;
