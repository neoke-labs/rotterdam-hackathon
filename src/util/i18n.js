import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          self_service: {
            nonexistent_reservation: "Nonexistent reservation",
            nonexistent_aruba_verified_traveller_credential:
              "Nonexistent Aruba ED Card",
            credential_already_issued: "The credential has been issued",
            proof_already_provided: "The documentation has been provided",
          },
          admin: {
            checkin: {
              title: "Check-in",
            },
            general: {
              running: "Running",
              database: "Database",
              state: "State",
              server: "Server",
              connected: "Connected",
              click_to_prune: "Click ok to prune data",
              prune_data: "Prune data",
              general: "General",
            },
          },
          button: {
            obtain_credential: "Get reservation card",
            obtain_proof_of_stay: "Obtain a proof of stay",
            request_proof: "Check-in remotely",
            check_in: "Show proof of Check-in",
            delete: "Delete",
            dismiss: "Dismiss",
          },
          form: {
            generic: {
              button: {
                click_to_upload: "Click to upload",
                create_hotel: "Create hotel",
              },
              field: {
                email: "E-mail",
                date_of_birth: "Date of birth",
                first_name: "First Name",
                last_name: "Last Name",
                hotel_id: "Hotel ID",
                hotel_name: "Name",
                city: "City",
                destination: "Destination",
                address: "Address",
                slogan: "Slogan",
                description: "Description",
                price: "Price (€ per night)",
                receive_email_notifications: "Receive e-mail notifications",
                password: "Password",
                dates: "Dates",
                hotel: "Hotel",
                image: "Image",
                first_word: "First word",
                second_word: "Second word",
                third_word: "Third word",
                delta_days: "Delta days",
                check_in_hour: "Check-in hour",
                passport_number: "Passport number",
                passport_country: "Passport country",
                passport_expiry_date: "Passport expiry date",
                selfie: "Selfie",
                speedy_check_in: "Enable speedy check-in",
                placeholder: {
                  email: "Enter your e-mail address",
                  first_name: "Enter your first name",
                  last_name: "Enter your last name",
                  hotel_name: "Enter the hotel name",
                  destination: "Enter the destination",
                  city: "Enter the city",
                  address: "Enter the address",
                  slogan: "Enter the slogan",
                  description: "Enter the description",
                  price: "Select the price",
                  hotel: "Select a hotel",
                  passport_number: "Enter your passport number",
                  passport_country: "Enter your passport country",
                },
                validation: {
                  name_in_use: "Name in use",
                  selfie: "Please upload a selfie",
                  first_name: "Please input your first name",
                  last_name: "Please input your last name",
                  passport_number: "Please input your passport number",
                  passport_country: "Please input your passport country",
                  passport_expiry_date: "Please select date",
                  email: "Please input your e-mail",
                  valid_email: "The input is not a valid e-mail address",
                  password: "Please enter your password",
                  dates: "Please select dates",
                  date_of_birth: "Please select date",
                  hotel: "Please select hotel",
                  hotel_name: "Please input the name",
                  city: "Please input the city",
                  destination: "Please select the destination",
                  address: "Please input the address",
                  slogan: "Please input the slogan",
                  description: "Please input the description",
                  price: "Please select the price",
                  image: "Please upload a image",
                  required_word: "Please enter the word",
                  invalid_dictionary_word: "Unrecognized word",
                  required_integer_value: "Required integer value",
                  delta_days: "Please input delta days",
                  check_in_hour: "Plese input check-in hour",
                  required_hour_value: "The input is not a valid check-in hour",
                },
              },
            },
            arubaVerifiedTravellerCredential: {
              button: {
                agency: "Generate Aruba ED Card",
                user: "Get Aruba ED Card",
              },
              field: {
                placeholder: {
                  email: "Enter the e-mail address",
                  first_name: "Enter the first name",
                  last_name: "Enter the last name",
                  passport_number: "Enter the passport number",
                  passport_country: "Enter the passport country",
                },
                validation: {
                  email: "Please input the e-mail",
                  first_name: "Please input the first name",
                  last_name: "Please input the last name",
                  passport_number: "Please input the passport number",
                  passport_country: "Please input the passport country",
                },
              },
              result: {
                title: "Success!",
                description:
                  "The Aruba ED Card has been issued<1></1>We've sent a link to <3>{{mail}}</3>",
              },
            },
            account: {
              button: "Update account details",
            },
            reserve: {
              button: "Reserve your stay",
              speedy_check_in_label: "Speedy check in",
              speedy_check_in_description:
                "Say goodbye to filling up forms and to waiting lines at the hotel",
            },
            search: {
              button: "Search",
            },
            sign_in: {
              button: "Log in",
            },
            search_by_passcode: {
              button: "Search",
            },
            sign_up: {
              field: {
                confirm_password: "Confirm Password",
                validation: {
                  valid_email: "The input is not a valid e-mail address",
                  different_passwords:
                    "The two passwords that you entered do not match",
                  confirm_password: "Please confirm your password",
                },
              },
              button: "Sign up",
            },
            check_in: {
              button: "Modify",
            },
          },
          link: {
            go_home: "Go home",
            go_admin: "Go back to admin panel",
          },
          menu: {
            account: {
              log_out: "Log out",
              account: "Account",
              sign_in: "Sign in",
              sign_up: "Sign up",
              authenticate: "Login",
            },
            search: "Reserve",
            reservations: "Reservations",
            hotels: {
              hotel: "My hotels",
              user: "Hotels",
            },
          },
          modal: {
            request_credential: {
              mobile: {
                title:
                  "Click the button to obtain the credential using Neoke app",
                link: "Obtain credential",
              },
              browser: {
                title: "Please scan with your phone",
              },
              waiting_acceptance: "Waiting acceptance...",
            },
            reservation_proof_request: {
              mobile: {
                title:
                  "Click the button to provide the documentation using Neoke app",
                link: "Provide documentation",
              },
              browser: {
                title: "Please scan with your phone",
              },
              waiting_confirmation: "Waiting confirmation",
            },
            delete_reservation: {
              title: "Do you want to delete this reservation?",
              body: "Please confirm, by clicking on the 'OK' button",
            },
            check_in: {
              title: "Reservation {{reservation}}",
              body: {
                qr_link: "QR link",
                manual_link: "Manual link",
                passcode: "Passcode",
              },
            },
            sign_in: {
              title: "Sign in",
            },
            sign_up: {
              title: "Sign up",
            },
          },
          notification: {
            auth_internal_problem: {
              title: "Authentication internal problem",
              body: "Server internal problem",
            },
            credential_request_internal_problem: {
              title: "Credential request internal problem",
              body: "Server internal problem",
            },
            credential_proof_request_internal_problem: {
              title: "Credential proof request internal problem",
              body: "Server internal problem",
            },
            credential_sent: {
              title: "Credential sent",
              body: "Please download it, using the Neoke app",
            },
            proof_request_sent: {
              title: "Proof request sent",
              body: "Please approve it, using the Neoke app",
            },
            reservation_deleted: {
              title: "Reservation deleted",
              body: "Your reservation '{{reservation}}' has been deleted",
            },
            account_created: {
              title: "Account created",
              body: "Sucess! Your account has been created",
            },
            account_not_found: {
              title: "Account error",
              body: "Account '{{account}}' not found",
            },
            account_sign_in: {
              title: "Account sign in",
              body: "Hello again {{account}}",
            },
            account_updated: {
              title: "Account updated",
              body: "Account '{{account}}' updated",
            },
            invalid_account: {
              title: "Invalid account",
              body: "Invalid e-mail or password",
            },
            invalid_email_registration: {
              title: "Invalid e-mail",
              body: "E-mail is already registered",
            },
            connection_error: {
              title: "Connection error",
              body: "Server connection error {{error}}",
            },
            passcode_invalid: {
              title: "Reservation not found",
              body: "The passcode does not correspond to any reservation",
            },
            close_website: {
              tooltip: "Select website",
              title: "Leave the website",
              body: "When you click ok your session will be closed and you will return to the website selector",
            },
          },
          panel: {
            auth: {
              mobile: {
                title: "Click to authenticate using Neoke app",
                link: "Authenticate",
              },
              browser: {
                title: "Scan the QR code using your phone",
              },
              title: {
                aruba: "Log in with QR code",
              },
            },
            hotel: {
              speedy_check_in: "Speedy check in",
            },
            data: {
              hotel: {
                title: "Data",
              },
              user: {
                title: "Data",
              },
            },
            no_proof: {
              title: "Proof data",
              body: "The documentation of this reservation hasn't been received",
            },
            proof: {
              title: "Proof data",
              body: {
                divider: {
                  reservation_data: "From reservation",
                  official_document_data: "From official document",
                  official_document_selfie: "Official document selfie",
                },
              },
            },
            reservation: {
              title: "Reservation data",
              state: {
                reservation_created: "Reservation created",
                credential_obtained: "Credential obtained",
                documentation_sent: "Room-key created",
                proof_of_stay_obtained: "Proof of stay obtained",
                state: "State",
                yes: "Yes",
                no: "No",
              },
              divider: {
                actions: "Actions",
                state: "State: {{state}}",
                values: "Values",
              },
            },
          },
          proof_field: {
            reservation_number: "Reservation Number",
            check_in_date: "Check-in Date",
            first_name: "First Name",
            last_name: "Last Name",
            full_name: "Full Name",
            dates: "Dates",
            passport_number: "Passport Number",
            issuing_country: "Issuing Country",
            date_of_birth: "Date of Birth",
            expiry_date: "Expiry Date",
          },
          reservation_field: {
            reservation_number: "Reservation Number",
            email: "E-mail",
            first_name: "First Name",
            last_name: "Last Name",
            check_in_date: "Check-in Date",
            check_out_date: "Check-out Date",
          },
          section: {
            website_selector: {
              title: "The next generation Passport to experience the World",
              body_title: "What would you like to do?",
              divider: {
                for_users: "End user",
                for_hotels: "Hotel staff",
              },
              button: {
                form: "Get Aruba ED Card",
                user: "Reserve next stay",
                hotel: "Manage reservations",
              },
            },
            hotels: {
              title: {
                owner: "Your hotels",
                general: "Hotels",
              },
              empty: "There are no hotels for your query",
              button: {
                create_hotel: "Create a new hotel",
              },
            },
            hotel: {
              button: {
                see_details: "See details",
                reserve: "Book now",
              },
            },
            create_hotel: {
              title: "Create a new hotel",
            },
            admin: {
              title: "Admin panel",
            },
            auth: {
              title: "Authenticate yourself",
              waiting_confirmation: "Waiting confirmation...",
            },
            account: {
              title: "Manage your account",
            },
            home: {
              title: "Savaneta tours",
              subtitle:
                "A demo travel agent website to book your dream stay in Aruba.",
            },
            reservation: {
              title: "Manage your reservation",
            },
            proof: {
              title: "Success!",
              subtitle:
                "The passport and the reservation of this guest have been previously verified",
            },
            reservations: {
              title: "Your reservations",
            },
            not_found: {
              title: "404 - Not Found",
            },
            reserve: {
              title: "Reserve your next stay",
            },
            search: {
              title: "Search for your next trip",
            },
            arubaVerifiedTravellerCredential: {
              success: "Success!",
              title: {
                user: "Get Aruba ED Card",
                agency: "Generate Aruba ED Card",
              },
              subtitle: "We'll need the following information",
            },
          },
          state: {
            created: "Created",
            issuing_credential: "Issuing credential",
            waiting_credential_acceptance: "Waiting credential acceptance",
            waiting_documentation: "Waiting documentation",
            waiting_proof_acceptance: "Waiting documentation proof share",
            ready: "Ready to check-in",
            proof_of_stay_available: "Proof of stay available",
            proof_of_stay_received: "Proof of stay received",
          },
          table: {
            reservations: {
              column: {
                reservation_number: "Reservation Number",
                full_name: "Full Name",
                hotel: "Hotel",
                dates: "Dates",
              },
              button: {
                passcode: "Search",
                delete: "Delete",
              },
            },
          },
          check_in_states: {
            checked_in: "Checked-in",
            arrived: "Arrived",
            no_show: "No-show",
            check_in_available_when: "Check-in available {{when}}",
            in_n_days: "in {{n}} days",
            tomorrow: "tomorrow",
            today: "today",
            button: "Mark as arrived",
          },
        },
      },
    },
  });

export default i18n;
