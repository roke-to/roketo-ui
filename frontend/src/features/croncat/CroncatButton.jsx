import React from 'react';
import {useNear} from '../near-connect';
import {useAccount} from '../xyiming-resources';
import {Button} from '../../components/kit/Button';
import {CronIcon} from '../../components/icons/Cron';
import {useBool} from '../../lib/useBool';
import Modal from 'react-modal/lib/components/Modal';

const CRON_STATUS = {
  RUNNING: 'RUNNING',
  NOT_RUNNING: 'NOT_RUNNING',
  INITIALIZING: 'INITIALIZING',
};

// const CronTaskCreateScheme = Yup.object().shape({
//   cronDeposit: Yup.string().required('Deposit is a required'),
//   cadence: Yup.string().required('Period is a required'),
// });

export function CroncatButton() {
  const near = useNear();
  const modalControl = useBool(false);
  const accountSWR = useAccount({near});
  // const tf = useTokenFormatter('NEAR');

  // useEffect(() => {
  //   async function fetchTasks() {
  //     const tasks = await near.croncat.getAllTasks({});
  //     console.debug('My Tasks:', tasks);
  //   }
  //   fetchTasks();
  // }, []);

  function cronSubscribeClick() {
    modalControl.turnOn();
  }

  // async function createTask({cadence, cronDeposit}) {
  //   console.debug('Creating task', {
  //     cadence,
  //     cronDeposit,
  //   });
  //   await near.croncat.createTask({
  //     amount: tf.toInt(cronDeposit),
  //     cadence,
  //   });
  // }

  const accountData = accountSWR.data;

  const cronStatus = accountData
    ? accountData.cron_task
      ? CRON_STATUS.RUNNING
      : CRON_STATUS.NOT_RUNNING
    : CRON_STATUS.INITIALIZING;

  // const cadences = [
  //   {
  //     value: '*/10 * * * * *',
  //     label: 'Every 10 minutes',
  //   },
  //   {
  //     value: '0 0-23 * * * *',
  //     label: 'Every hour',
  //   },
  //   {
  //     value: '0 0 * * * *',
  //     label: 'Every day',
  //   },
  // ];

  const modal = (
    <Modal
      isOpen={modalControl.on}
      onRequestClose={modalControl.turnOff}
      className="ModalContent"
      overlayClassName="ModalOverlay"
    >
      <h2 className="text-2xl mb-6">CRON subscription</h2>
      <p>
        We provide Cron via Croncat. Croncat is temporary disabled due to
        technical issues, we are helping them to resolve
      </p>
    </Modal>
  );

  // const modal = (
  //   <Modal
  //     isOpen={modalControl.on}
  //     onRequestClose={modalControl.turnOff}
  //     className="ModalContent"
  //     overlayClassName="ModalOverlay"
  //   >
  //     <h2 className="text-2xl mb-6">CRON setup</h2>
  //     <Formik
  //       initialValues={{
  //         cadence: cadences[1].value,
  //         cronDeposit: 1,
  //       }}
  //       validationSchema={CronTaskCreateScheme}
  //       onSubmit={createTask}
  //       validateOnBlur={false}
  //       validateOnChange={false}
  //       validateOnMount={false}
  //     >
  //       {({
  //         values,
  //         setFieldValue,
  //         setFieldTouched,
  //         handleSubmit,
  //         isSubmitting,
  //         errors,
  //       }) => {
  //         console.debug(errors);
  //         return (
  //           <form onSubmit={handleSubmit}>
  //             <Field name="cronDeposit">
  //               {({
  //                 field, // { name, value, onChange, onBlur }
  //                 form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  //                 meta,
  //               }) => (
  //                 <FormField
  //                   label="Cron Deposit:"
  //                   className="mb-4"
  //                   error={meta.error}
  //                 >
  //                   <Input error={meta.error}>
  //                     <input placeholder={'1 NEAR'} {...field} />
  //                   </Input>
  //                 </FormField>
  //               )}
  //             </Field>
  //             <Field name="cadence">
  //               {({
  //                 field, // { name, value, onChange, onBlur }
  //                 form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  //                 meta,
  //               }) => {
  //                 return (
  //                   <FormField label="Withdraw funds:" error={meta.error}>
  //                     <div className="flex flex-col spacy-y-3">
  //                       {cadences.map((option) => {
  //                         return (
  //                           <RadioButton
  //                             label={
  //                               <div className="inline-flex items-center">
  //                                 {option.label}
  //                               </div>
  //                             }
  //                             active={field.value === option.value}
  //                             value={option.value}
  //                             onChange={(value) => {
  //                               setFieldValue(field.name, value, false);
  //                               setFieldTouched(field.name, true, false);
  //                             }}
  //                           />
  //                         );
  //                       })}
  //                     </div>
  //                   </FormField>
  //                 );
  //               }}
  //             </Field>
  //             <Button
  //               className="w-full mt-6"
  //               variant="filled"
  //               type="submit"
  //               disabled={isSubmitting}
  //             >
  //               Add funds
  //             </Button>
  //           </form>
  //         );
  //       }}
  //     </Formik>
  //   </Modal>
  // );

  return (
    <>
      <Button
        variant="main"
        size="normal"
        className="p-0"
        onClick={(e) => cronSubscribeClick(e)}
      >
        <span className="mr-2">
          <CronIcon />
        </span>
        {cronStatus === CRON_STATUS.RUNNING
          ? 'Update task'
          : cronStatus === CRON_STATUS.NOT_RUNNING
          ? 'Subscribe to CRON'
          : cronStatus === CRON_STATUS.INITIALIZING
          ? 'Initializing CRON'
          : ''}
      </Button>
      {modalControl.on ? modal : null}
    </>
  );
}
