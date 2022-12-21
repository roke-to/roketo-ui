import * as Yup from 'yup';

export const formValidationSchema = Yup.object().shape({
  nftContractId: Yup.string().required('NFT Contract is required'),
  streamName: Yup.string().max(100, 'Stream name must be less or equal 100 symbols'),
  token: Yup.string().required(),
  deposit: Yup.number()
    .required('Deposit is required')
    .moreThan(0, 'Deposit should be more than 0'),
  nftId: Yup.number().required(),
});
